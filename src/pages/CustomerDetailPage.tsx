import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ProCard, PageContainer } from '@ant-design/pro-components'
import { Descriptions, Button, Tabs, Table, Spin, message, Empty, Tag } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { customersRepo, leadsRepo, dealsRepo } from '../repos'
import { CustomerForm } from '../components/CustomerForm'
import type { Customer, Lead, Deal } from '../types'
import { formatDateTime } from '../utils/format'
import { getLeadStatusTagColor, getLeadSourceTagColor, getDealStageTagColor } from '../utils/tagColors'
import { useCurrency } from '../context/CurrencyContext'

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['customers', 'common'])
  const { formatPrice } = useCurrency()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = () => {
    if (!id) return
    setLoading(true)
    customersRepo.get(id).then((c) => {
      setCustomer(c ?? null)
      if (!c) {
        setLoading(false)
        return
      }
      Promise.all([
        leadsRepo.list({ pageSize: 100 }),
        dealsRepo.list({ pageSize: 100 }),
      ]).then(([lRes, dRes]) => {
        setLeads(lRes.items.filter((l) => l.customerId === id))
        setDeals(dRes.items.filter((d) => d.customerId === id))
        setLoading(false)
      })
    })
  }

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    load()
  }, [id])

  const handleUpdate = async (values: Pick<Customer, 'name' | 'phone' | 'email' | 'notes'>) => {
    if (!customer) return
    setSaving(true)
    try {
      await customersRepo.update(customer.id, values)
      message.success(t('customers:updatedSuccess'))
      setEditing(false)
      load()
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('customers:updateError'))
    } finally {
      setSaving(false)
    }
  }

  if (loading && !customer) return <Spin size="large" style={{ display: 'block', margin: 48 }} />
  if (!id || !customer) {
    return (
      <PageContainer title={t('customers:detailTitle')} onBack={() => navigate('/customers')} backIcon={<ArrowLeftOutlined />}>
        <Empty description={t('customers:notFound')}>
          <Button type="primary" onClick={() => navigate('/customers')}>{t('common:backToList')}</Button>
        </Empty>
      </PageContainer>
    )
  }

  const purchaseHistory = deals.filter((d) => d.stage === 'closed_won')

  if (editing) {
    return (
      <PageContainer title={t('customers:editCustomer')} onBack={() => setEditing(false)} backIcon={<ArrowLeftOutlined />}>
        <ProCard style={{ borderRadius: 8 }}>
          <CustomerForm
            initial={customer}
            loading={saving}
            onFinish={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        </ProCard>
      </PageContainer>
    )
  }

  const tabItems = [
    {
      key: 'info',
      label: t('customers:info'),
      children: (
        <ProCard bordered style={{ borderRadius: 8 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label={t('customers:name')}>{customer.name}</Descriptions.Item>
            <Descriptions.Item label={t('customers:phone')}>{customer.phone ? <a href={`tel:${customer.phone}`}>{customer.phone}</a> : t('common:dash')}</Descriptions.Item>
            <Descriptions.Item label={t('customers:email')}>{customer.email ? <a href={`mailto:${customer.email}`}>{customer.email}</a> : t('common:dash')}</Descriptions.Item>
            <Descriptions.Item label={t('customers:notes')} span={2}>{customer.notes ?? t('common:dash')}</Descriptions.Item>
          </Descriptions>
        </ProCard>
      ),
    },
    {
      key: 'leads',
      label: t('customers:leadsTab', { count: leads.length }),
      children: (
        <ProCard bordered style={{ borderRadius: 8 }}>
          <Table
            size="small"
            rowKey="id"
            dataSource={leads}
            columns={[
              { dataIndex: 'source', title: t('customers:source'), render: (_: unknown, r: Lead) => <Tag color={getLeadSourceTagColor(r.source)}>{r.source}</Tag> },
              { dataIndex: 'status', title: t('customers:status'), render: (_: unknown, r: Lead) => <Tag color={getLeadStatusTagColor(r.status)}>{r.status}</Tag> },
              { dataIndex: 'createdAt', title: t('customers:createdAt'), render: (v: string) => formatDateTime(v) },
              {
                title: '',
                render: (_: unknown, r: Lead) => (
                  <Button type="link" size="small" onClick={() => navigate(`/leads/${r.id}`)}>
                    {t('common:view')}
                  </Button>
                ),
              },
            ]}
            pagination={false}
          />
        </ProCard>
      ),
    },
    {
      key: 'deals',
      label: t('customers:dealsTab', { count: deals.length }),
      children: (
        <ProCard bordered style={{ borderRadius: 8 }}>
          <Table
            size="small"
            rowKey="id"
            dataSource={deals}
            columns={[
              { dataIndex: 'stage', title: t('customers:stage'), render: (_: unknown, r: Deal) => <Tag color={getDealStageTagColor(r.stage)}>{r.stage}</Tag> },
              { dataIndex: 'expectedPrice', title: t('customers:expectedPrice'), render: (v: number) => formatPrice(v) },
              { dataIndex: 'finalPrice', title: t('customers:finalPrice'), render: (v: number) => formatPrice(v) },
              {
                title: '',
                render: (_: unknown, r: Deal) => (
                  <Button type="link" size="small" onClick={() => navigate(`/deals/${r.id}`)}>
                    {t('common:view')}
                  </Button>
                ),
              },
            ]}
            pagination={false}
          />
        </ProCard>
      ),
    },
    {
      key: 'purchase',
      label: t('customers:purchaseTab', { count: purchaseHistory.length }),
      children: (
        <ProCard bordered style={{ borderRadius: 8 }}>
          <Table
            size="small"
            rowKey="id"
            dataSource={purchaseHistory}
            columns={[
              { dataIndex: 'vehicleId', title: t('customers:vehicle') },
              { dataIndex: 'finalPrice', title: t('customers:finalPriceVnd'), render: (v: number) => formatPrice(v) },
              { dataIndex: 'updatedAt', title: t('customers:updatedAt'), render: (v: string) => formatDateTime(v) },
            ]}
            pagination={false}
          />
        </ProCard>
      ),
    },
  ]

  return (
    <div className="customer-detail-page">
    <PageContainer
      title={customer.name}
      onBack={() => navigate('/customers')}
      backIcon={<ArrowLeftOutlined />}
      breadcrumb={{
        items: [
          { title: <Link to="/customers">{t('customers:title')}</Link> },
          { title: customer.name },
        ],
      }}
      extra={[
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
          {t('common:edit')}
        </Button>,
      ]}
    >
      <Tabs items={tabItems} />
    </PageContainer>
    </div>
  )
}
