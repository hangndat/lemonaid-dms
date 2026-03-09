import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProCard, PageContainer } from '@ant-design/pro-components'
import { Row, Col, Statistic, Table, Tag, Space, Progress, Typography } from 'antd'
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RightOutlined,
  UserOutlined,
  FundOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { vehiclesRepo, leadsRepo, dealsRepo, profilesRepo } from '../repos'
import type { VehicleStatus } from '../types'
import type { Profile, Lead, Deal } from '../types'
import { getLeadStatusTagColor } from '../utils/tagColors'
import { getDealStageTagColor } from '../utils/tagColors'
import { useCurrency } from '../context/CurrencyContext'
import { formatDateTime } from '../utils/format'
import type { LeadStatus } from '../types'
import type { DealStage } from '../types'

const { Text } = Typography

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
  const [totalRevenue, setTotalRevenue] = useState<number>(0)
  const [salesByPerson, setSalesByPerson] = useState<{ name: string; deals: number; total: number }[]>([])
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [openDeals, setOpenDeals] = useState<Deal[]>([])
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

      const revenue = wonDeals.reduce((sum, d) => sum + (d.finalPrice ?? 0), 0)
      setTotalRevenue(revenue)

      const byPerson: Record<string, { deals: number; total: number }> = {}
      wonDeals.forEach((d) => {
        const id = d.assignedTo
        if (!byPerson[id]) byPerson[id] = { deals: 0, total: 0 }
        byPerson[id].deals += 1
        byPerson[id].total += d.finalPrice ?? 0
      })
      setSalesByPerson(
        Object.entries(byPerson)
          .map(([id, v]) => ({
            name: profileMap.get(id)?.fullName ?? id,
            deals: v.deals,
            total: v.total,
          }))
          .sort((a, b) => b.total - a.total)
      )

      const recent = [...lRes.items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setRecentLeads(recent.slice(0, 5))

      const open = dRes.items.filter(
        (d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost'
      )
      const openSorted = [...open].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      setOpenDeals(openSorted.slice(0, 5))

      setLoading(false)
    }
    load()
  }, [])

  const totalVehicles =
    vehicleCounts.draft + vehicleCounts.available + vehicleCounts.reserved + vehicleCounts.sold

  const statCard = (
    title: string,
    value: number | string,
    icon: React.ReactNode,
    to?: string
  ) => (
    <ProCard loading={loading} bordered style={{ borderRadius: 8 }}>
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {title}
        </Text>
        <Statistic
          value={value}
          valueStyle={{ fontSize: 22, fontWeight: 600 }}
          prefix={icon}
        />
        {to && (
          <Link to={to} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            {t('dashboard:viewAll')} <RightOutlined />
          </Link>
        )}
      </Space>
    </ProCard>
  )

  return (
    <div className="dashboard-page">
      <PageContainer title={t('dashboard:title')} subTitle={t('dashboard:subTitle')}>
        {/* Kho xe + Tổng doanh thu */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={4}>
            {statCard(
              t('dashboard:totalVehicles'),
              totalVehicles,
              <CarOutlined style={{ color: '#1890ff' }} />,
              '/inventory'
            )}
          </Col>
          <Col xs={24} sm={12} md={4}>
            {statCard(
              t('dashboard:available'),
              vehicleCounts.available,
              <CheckCircleOutlined style={{ color: '#52c41a' }} />,
              '/inventory'
            )}
          </Col>
          <Col xs={24} sm={12} md={4}>
            {statCard(
              t('dashboard:reserved'),
              vehicleCounts.reserved,
              <ClockCircleOutlined style={{ color: '#faad14' }} />,
              '/inventory'
            )}
          </Col>
          <Col xs={24} sm={12} md={4}>
            {statCard(
              t('dashboard:sold'),
              vehicleCounts.sold,
              <ShoppingOutlined style={{ color: '#722ed1' }} />,
              '/inventory'
            )}
          </Col>
          <Col xs={24} sm={12} md={8}>
            <ProCard
              loading={loading}
              bordered
              style={{ borderRadius: 8, borderLeft: '4px solid #52c41a' }}
            >
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {t('dashboard:totalRevenue')}
                </Text>
                <Statistic
                  value={totalRevenue}
                  formatter={() => formatPrice(totalRevenue)}
                  valueStyle={{ fontSize: 20, fontWeight: 600, color: '#52c41a' }}
                  prefix={<DollarOutlined />}
                />
                <Link to="/deals" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {t('dashboard:viewDeals')} <RightOutlined />
                </Link>
              </Space>
            </ProCard>
          </Col>
        </Row>

        {/* Lead theo trạng thái + Deal theo giai đoạn */}
        <Row gutter={[16, 16]}>
          <Col span={24} md={12}>
            <ProCard
              title={
                <Space>
                  <UserOutlined />
                  {t('dashboard:leadsByStatus')}
                </Space>
              }
              loading={loading}
              bordered
              style={{ borderRadius: 8 }}
              extra={
                <Link to="/leads">{t('dashboard:viewAll')}</Link>
              }
            >
              <Space wrap size={[8, 8]}>
                {(Object.entries(leadCounts) as [LeadStatus, number][]).map(([k, v]) => (
                  <Tag key={k} color={getLeadStatusTagColor(k)}>
                    {t(LEAD_STATUS_I18N[k] ?? k)}: {v}
                  </Tag>
                ))}
                {Object.keys(leadCounts).length === 0 && !loading && (
                  <span style={{ color: '#999' }}>{t('dashboard:noLeads')}</span>
                )}
              </Space>
            </ProCard>
          </Col>
          <Col span={24} md={12}>
            <ProCard
              title={
                <Space>
                  <FundOutlined />
                  {t('dashboard:dealsByStage')}
                </Space>
              }
              loading={loading}
              bordered
              style={{ borderRadius: 8 }}
              extra={
                <Link to="/deals">{t('dashboard:viewAll')}</Link>
              }
            >
              <Space wrap size={[8, 8]}>
                {(Object.entries(dealCounts) as [DealStage, number][]).map(([k, v]) => (
                  <Tag key={k} color={getDealStageTagColor(k)}>
                    {t(DEAL_STAGE_I18N[k] ?? k)}: {v}
                  </Tag>
                ))}
                {Object.keys(dealCounts).length === 0 && !loading && (
                  <span style={{ color: '#999' }}>{t('dashboard:noDeals')}</span>
                )}
              </Space>
            </ProCard>
          </Col>
        </Row>

        {/* Tỷ lệ chốt + Doanh số theo nhân viên */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24} md={12}>
            <ProCard
              title={t('dashboard:conversionRate', { rate: conversionRate })}
              loading={loading}
              bordered
              style={{ borderRadius: 8 }}
            >
              <Progress
                type="circle"
                percent={conversionRate}
                size={120}
                strokeColor={conversionRate >= 20 ? '#52c41a' : conversionRate >= 10 ? '#faad14' : '#ff4d4f'}
              />
            </ProCard>
          </Col>
          <Col span={24} md={12}>
            <ProCard
              title={t('dashboard:salesByStaff')}
              loading={loading}
              bordered
              style={{ borderRadius: 8 }}
              extra={
                <Link to="/deals">{t('dashboard:viewDeals')}</Link>
              }
            >
              <Table
                size="small"
                dataSource={salesByPerson}
                columns={[
                  {
                    dataIndex: 'name',
                    title: t('dashboard:staff'),
                    render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
                  },
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

        {/* Lead mới nhất + Deal đang mở */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24} md={12}>
            <ProCard
              title={t('dashboard:recentLeads')}
              loading={loading}
              bordered
              style={{ borderRadius: 8 }}
              extra={
                <Link to="/leads">{t('dashboard:viewAll')}</Link>
              }
            >
              {recentLeads.length === 0 && !loading ? (
                <Text type="secondary">{t('dashboard:noRecentLeads')}</Text>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                  {recentLeads.map((l) => (
                    <div
                      key={l.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <div>
                        <Link to={`/leads/${l.id}`} style={{ fontWeight: 500 }}>
                          {l.name || l.phone || l.email || l.id.slice(0, 8)}
                        </Link>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDateTime(l.createdAt)}
                        </Text>
                      </div>
                      <Tag color={getLeadStatusTagColor(l.status)}>{t(LEAD_STATUS_I18N[l.status] ?? l.status)}</Tag>
                    </div>
                  ))}
                </Space>
              )}
            </ProCard>
          </Col>
          <Col span={24} md={12}>
            <ProCard
              title={t('dashboard:openDeals')}
              loading={loading}
              bordered
              style={{ borderRadius: 8 }}
              extra={
                <Link to="/deals">{t('dashboard:viewAll')}</Link>
              }
            >
              {openDeals.length === 0 && !loading ? (
                <Text type="secondary">{t('dashboard:noOpenDeals')}</Text>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                  {openDeals.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <div>
                        <Link to={`/deals/${d.id}`} style={{ fontWeight: 500 }}>
                          Deal #{d.id.slice(0, 8)}
                        </Link>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDateTime(d.updatedAt)}
                        </Text>
                      </div>
                      <Tag color={getDealStageTagColor(d.stage)}>{t(DEAL_STAGE_I18N[d.stage] ?? d.stage)}</Tag>
                    </div>
                  ))}
                </Space>
              )}
            </ProCard>
          </Col>
        </Row>
      </PageContainer>
    </div>
  )
}
