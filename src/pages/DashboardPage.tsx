import { useEffect, useState } from 'react'
import { ProCard, PageContainer } from '@ant-design/pro-components'
import { Row, Col, Statistic, Table } from 'antd'
import { vehiclesRepo, leadsRepo, dealsRepo, profilesRepo } from '../repos'
import type { VehicleStatus } from '../types'
import type { Profile } from '../types'

export function DashboardPage() {
  const [vehicleCounts, setVehicleCounts] = useState<Record<VehicleStatus, number>>({
    draft: 0,
    available: 0,
    reserved: 0,
    sold: 0,
  })
  const [leadCounts, setLeadCounts] = useState<Record<string, number>>({})
  const [dealCounts, setDealCounts] = useState<Record<string, number>>({})
  const [conversionRate, setConversionRate] = useState<number>(0)
  const [salesByPerson, setSalesByPerson] = useState<{ name: string; deals: number; total: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [vRes, lRes, dRes, profiles] = await Promise.all([
        vehiclesRepo.list({ pageSize: 1000 }),
        leadsRepo.list({ pageSize: 1000 }),
        dealsRepo.list({ pageSize: 1000 }),
        profilesRepo.list(),
      ])
      const profileMap = new Map<string, Profile>(profiles.map((p) => [p.id, p]))
      const vByStatus: Record<VehicleStatus, number> = {
        draft: 0,
        available: 0,
        reserved: 0,
        sold: 0,
      }
      vRes.items.forEach((v) => {
        vByStatus[v.status] = (vByStatus[v.status] ?? 0) + 1
      })
      setVehicleCounts(vByStatus)

      const lByStatus: Record<string, number> = {}
      lRes.items.forEach((l) => {
        lByStatus[l.status] = (lByStatus[l.status] ?? 0) + 1
      })
      setLeadCounts(lByStatus)

      const dByStage: Record<string, number> = {}
      const wonDeals = dRes.items.filter((d) => d.stage === 'closed_won')
      dRes.items.forEach((d) => {
        dByStage[d.stage] = (dByStage[d.stage] ?? 0) + 1
      })
      setDealCounts(dByStage)

      const totalLeads = lRes.items.length
      const won = wonDeals.length
      setConversionRate(totalLeads > 0 ? Math.round((won / totalLeads) * 100) : 0)

      const byPerson: Record<string, { deals: number; total: number }> = {}
      wonDeals.forEach((d) => {
        const id = d.assignedTo
        if (!byPerson[id]) byPerson[id] = { deals: 0, total: 0 }
        byPerson[id].deals += 1
        byPerson[id].total += d.finalPrice ?? 0
      })
      setSalesByPerson(
        Object.entries(byPerson).map(([id, v]) => ({
          name: profileMap.get(id)?.fullName ?? id,
          deals: v.deals,
          total: v.total,
        }))
      )
      setLoading(false)
    }
    load()
  }, [])

  const totalVehicles =
    vehicleCounts.draft + vehicleCounts.available + vehicleCounts.reserved + vehicleCounts.sold

  return (
    <PageContainer title="Tổng quan" subTitle="Thống kê nhanh kho xe, lead và deal">
      <ProCard style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <ProCard loading={loading}>
              <Statistic title="Tổng xe" value={totalVehicles} />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard loading={loading}>
              <Statistic title="Sẵn sàng" value={vehicleCounts.available} />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard loading={loading}>
              <Statistic title="Đã đặt" value={vehicleCounts.reserved} />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard loading={loading}>
              <Statistic title="Đã bán" value={vehicleCounts.sold} />
            </ProCard>
          </Col>
        </Row>
      </ProCard>
      <Row gutter={[16, 16]}>
        <Col span={24} md={12}>
          <ProCard title="Lead theo trạng thái" loading={loading}>
            <pre style={{ margin: 0, fontSize: 12 }}>
              {Object.entries(leadCounts)
                .map(([k, v]) => `${k}: ${v}`)
                .join('  |  ')}
            </pre>
          </ProCard>
        </Col>
        <Col span={24} md={12}>
          <ProCard title="Deal theo giai đoạn" loading={loading}>
            <pre style={{ margin: 0, fontSize: 12 }}>
              {Object.entries(dealCounts)
                .map(([k, v]) => `${k}: ${v}`)
                .join('  |  ')}
            </pre>
          </ProCard>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24} md={12}>
          <ProCard title={`Tỷ lệ chốt (lead → closed_won) ${conversionRate}%`} loading={loading} />
        </Col>
        <Col span={24} md={12}>
          <ProCard title="Doanh số theo nhân viên (closed_won)" loading={loading}>
            <Table
              size="small"
              dataSource={salesByPerson}
              columns={[
                { dataIndex: 'name', title: 'Nhân viên' },
                { dataIndex: 'deals', title: 'Số deal' },
                {
                  dataIndex: 'total',
                  title: 'Tổng (VNĐ)',
                  render: (v: number) => (v / 1_000_000).toFixed(0) + ' tr',
                },
              ]}
              pagination={false}
            />
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  )
}
