import { useEffect, useState } from 'react'
import { ProCard, PageContainer } from '@ant-design/pro-components'
import { Row, Col, Statistic, Table, Tag, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { vehiclesRepo, leadsRepo, dealsRepo, profilesRepo } from '../repos'
import type { VehicleStatus } from '../types'
import type { Profile } from '../types'
import { getLeadStatusTagColor } from '../utils/tagColors'
import { getDealStageTagColor } from '../utils/tagColors'
import { useCurrency } from '../context/CurrencyContext'
import type { LeadStatus } from '../types'
import type { DealStage } from '../types'

const LEAD_STATUS_I18N: Record<LeadStatus, string> = {
  new: 'leads:statusNew',
  contacted: 'leads:statusContacted',
  test_drive: 'leads:statusTestDrive',
  negotiation: 'leads:statusNegotiation',
  closed: 'leads:statusClosed',
  lost: 'leads:statusLost',
}
const DEAL_STAGE_I18N: Record<DealStage, string> = {
  lead: 'deals:stageLead',
  test_drive: 'deals:stageTestDrive',
  negotiation: 'deals:stageNegotiation',
  loan_processing: 'deals:stageLoan',
  closed_won: 'deals:stageWon',
  closed_lost: 'deals:stageLost',
}

export function DashboardPage() {
  const { t } = useTranslation(['dashboard', 'leads', 'deals'])
  const { formatPrice } = useCurrency()
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
    <div className="dashboard-page">
      <PageContainer title={t('dashboard:title')} subTitle={t('dashboard:subTitle')}>
        <ProCard className="dashboard-stats-card" style={{ marginBottom: 24, borderRadius: 8 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <ProCard loading={loading} bordered style={{ borderRadius: 8 }}>
                <Statistic title={t('dashboard:totalVehicles')} value={totalVehicles} />
              </ProCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ProCard loading={loading} bordered style={{ borderRadius: 8 }}>
                <Statistic title={t('dashboard:available')} value={vehicleCounts.available} />
              </ProCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ProCard loading={loading} bordered style={{ borderRadius: 8 }}>
                <Statistic title={t('dashboard:reserved')} value={vehicleCounts.reserved} />
              </ProCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ProCard loading={loading} bordered style={{ borderRadius: 8 }}>
                <Statistic title={t('dashboard:sold')} value={vehicleCounts.sold} />
              </ProCard>
            </Col>
          </Row>
        </ProCard>
        <Row gutter={[16, 16]}>
          <Col span={24} md={12}>
            <ProCard title={t('dashboard:leadsByStatus')} loading={loading} bordered style={{ borderRadius: 8 }}>
              <Space wrap size={[8, 8]}>
                {(Object.entries(leadCounts) as [LeadStatus, number][]).map(([k, v]) => (
                  <Tag key={k} color={getLeadStatusTagColor(k)}>{t(LEAD_STATUS_I18N[k] ?? k)}: {v}</Tag>
                ))}
                {Object.keys(leadCounts).length === 0 && !loading && <span style={{ color: '#999' }}>{t('dashboard:noLeads')}</span>}
              </Space>
            </ProCard>
          </Col>
          <Col span={24} md={12}>
            <ProCard title={t('dashboard:dealsByStage')} loading={loading} bordered style={{ borderRadius: 8 }}>
              <Space wrap size={[8, 8]}>
                {(Object.entries(dealCounts) as [DealStage, number][]).map(([k, v]) => (
                  <Tag key={k} color={getDealStageTagColor(k)}>{t(DEAL_STAGE_I18N[k] ?? k)}: {v}</Tag>
                ))}
                {Object.keys(dealCounts).length === 0 && !loading && <span style={{ color: '#999' }}>{t('dashboard:noDeals')}</span>}
              </Space>
            </ProCard>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24} md={12}>
            <ProCard title={t('dashboard:conversionRate', { rate: conversionRate })} loading={loading} bordered style={{ borderRadius: 8 }} />
          </Col>
          <Col span={24} md={12}>
            <ProCard title={t('dashboard:salesByStaff')} loading={loading} bordered style={{ borderRadius: 8 }}>
              <Table
                size="small"
                dataSource={salesByPerson}
                columns={[
                  { dataIndex: 'name', title: t('dashboard:staff'), render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
                  { dataIndex: 'deals', title: t('dashboard:dealCount') },
                  {
                    dataIndex: 'total',
                    title: t('dashboard:totalVnd'),
                    render: (v: number) => formatPrice(v),
                  },
                ]}
                pagination={false}
              />
            </ProCard>
          </Col>
        </Row>
      </PageContainer>
    </div>
  )
}
