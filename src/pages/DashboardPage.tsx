import { useEffect, useState } from 'react'
import { ProCard, PageContainer } from '@ant-design/pro-components'
import { Row, Col, Statistic, Table, Tag, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { vehiclesRepo, leadsRepo, dealsRepo, profilesRepo } from '../repos'
import type { VehicleStatus } from '../types'
import type { Profile } from '../types'

export function DashboardPage() {
  const { t } = useTranslation('dashboard')
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
    <PageContainer title={t('title')} subTitle={t('subTitle')}>
      <ProCard style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <ProCard loading={loading}>
              <Statistic title={t('totalVehicles')} value={totalVehicles} />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard loading={loading}>
              <Statistic title={t('available')} value={vehicleCounts.available} />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard loading={loading}>
              <Statistic title={t('reserved')} value={vehicleCounts.reserved} />
            </ProCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <ProCard loading={loading}>
              <Statistic title={t('sold')} value={vehicleCounts.sold} />
            </ProCard>
          </Col>
        </Row>
      </ProCard>
      <Row gutter={[16, 16]}>
        <Col span={24} md={12}>
          <ProCard title={t('leadsByStatus')} loading={loading}>
            <Space wrap size={[8, 8]}>
              {Object.entries(leadCounts).map(([k, v]) => (
                <Tag key={k}>{k}: {v}</Tag>
              ))}
              {Object.keys(leadCounts).length === 0 && !loading && <span style={{ color: '#999' }}>{t('noLeads')}</span>}
            </Space>
          </ProCard>
        </Col>
        <Col span={24} md={12}>
          <ProCard title={t('dealsByStage')} loading={loading}>
            <Space wrap size={[8, 8]}>
              {Object.entries(dealCounts).map(([k, v]) => (
                <Tag key={k}>{k}: {v}</Tag>
              ))}
              {Object.keys(dealCounts).length === 0 && !loading && <span style={{ color: '#999' }}>{t('noDeals')}</span>}
            </Space>
          </ProCard>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24} md={12}>
          <ProCard title={t('conversionRate', { rate: conversionRate })} loading={loading} />
        </Col>
        <Col span={24} md={12}>
          <ProCard title={t('salesByStaff')} loading={loading}>
            <Table
              size="small"
              dataSource={salesByPerson}
              columns={[
                { dataIndex: 'name', title: t('staff') },
                { dataIndex: 'deals', title: t('dealCount') },
                {
                  dataIndex: 'total',
                  title: t('totalVnd'),
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
