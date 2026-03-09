import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ProCard, PageContainer } from '@ant-design/pro-components'
import { Descriptions, Button, Input, List, Space, Spin, Form, InputNumber, Select, message, Empty, Tag } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { dealsRepo, profilesRepo, leadsRepo, customersRepo, vehiclesRepo } from '../repos'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import type { Deal, DealActivity, DealStage } from '../types'
import { formatDateTime, formatDate } from '../utils/format'
import { getDealStageTagColor } from '../utils/tagColors'
import type { Profile } from '../types'
import type { Lead } from '../types'
import type { Customer } from '../types'
import type { Vehicle } from '../types'

const { TextArea } = Input

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['deals', 'common'])
  const { user } = useAuth()
  const { formatPrice } = useCurrency()
  const [deal, setDeal] = useState<Deal | null>(null)

  const STAGE_OPTIONS: { value: DealStage; label: string }[] = [
    { value: 'lead', label: t('deals:stageLead') },
    { value: 'test_drive', label: t('deals:stageTestDrive') },
    { value: 'negotiation', label: t('deals:stageNegotiation') },
    { value: 'loan_processing', label: t('deals:stageLoan') },
    { value: 'closed_won', label: t('deals:stageWon') },
    { value: 'closed_lost', label: t('deals:stageLost') },
  ]
  const [activities, setActivities] = useState<DealActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const load = async () => {
    if (!id) return
    const [d, a] = await Promise.all([dealsRepo.get(id), dealsRepo.getActivities(id)])
    setDeal(d ?? null)
    setActivities(a)
  }

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    setLoading(true)
    load().then(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!deal) return
    Promise.all([
      profilesRepo.list(),
      leadsRepo.list({ pageSize: 500 }),
      customersRepo.list({ pageSize: 500 }),
      vehiclesRepo.list({ pageSize: 500 }),
    ]).then(([p, lRes, cRes, vRes]) => {
      setProfiles(p)
      setLeads(lRes.items)
      setCustomers(cRes.items)
      setVehicles(vRes.items)
    })
  }, [deal?.id])

  useEffect(() => {
    if (deal && editing) {
      form.setFieldsValue({
        stage: deal.stage,
        expectedPrice: deal.expectedPrice != null ? deal.expectedPrice / 1_000_000 : undefined,
        finalPrice: deal.finalPrice != null ? deal.finalPrice / 1_000_000 : undefined,
        expectedCloseDate: deal.expectedCloseDate ?? undefined,
        lostReason: deal.lostReason ?? '',
      })
    }
  }, [deal, editing, form])

  const handleSave = async () => {
    if (!deal) return
    try {
      const values = await form.validateFields()
      const newStage = values.stage as DealStage
      const prevStage = deal.stage
      setSaving(true)
      await dealsRepo.update(deal.id, {
        stage: newStage,
        expectedPrice: values.expectedPrice != null ? Math.round(values.expectedPrice * 1_000_000) : undefined,
        finalPrice: values.finalPrice != null ? Math.round(values.finalPrice * 1_000_000) : undefined,
        expectedCloseDate: values.expectedCloseDate || undefined,
        lostReason: values.lostReason?.trim() || undefined,
      })
      if (newStage !== prevStage) {
        await dealsRepo.addActivity(
          deal.id,
          'stage_change',
          `Chuyển từ ${prevStage} → ${newStage}`,
          user?.id
        )
      }
      message.success(t('deals:updatedSuccess'))
      setEditing(false)
      load()
    } catch (e) {
      const err = e as { errorFields?: unknown[] }
      if (err?.errorFields?.length) return // validation error
      message.error(e instanceof Error ? e.message : t('deals:updateError'))
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!id || !note.trim()) return
    setSubmitting(true)
    try {
      await dealsRepo.addActivity(id, 'note', note.trim(), user?.id)
      setNote('')
      await load()
      message.success(t('deals:noteAdded'))
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('deals:noteError'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !deal) return <Spin size="large" style={{ display: 'block', margin: 48 }} />
  if (!id || !deal) {
    return (
      <PageContainer title={t('deals:detailTitle')} onBack={() => navigate('/deals')} backIcon={<ArrowLeftOutlined />}>
        <Empty description={t('deals:notFound')}>
          <Button type="primary" onClick={() => navigate('/deals')}>{t('common:backToList')}</Button>
        </Empty>
      </PageContainer>
    )
  }

  if (editing) {
    return (
      <PageContainer title={t('deals:editDeal')} onBack={() => setEditing(false)} backIcon={<ArrowLeftOutlined />}>
        <ProCard style={{ borderRadius: 8 }}>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="stage" label={t('deals:stage')} rules={[{ required: true }]}>
              <Select options={STAGE_OPTIONS} />
            </Form.Item>
            <Form.Item name="expectedPrice" label={t('deals:expectedPriceMillion')}>
              <InputNumber min={0} style={{ width: '100%' }} addonAfter={t('deals:million')} placeholder="VD: 500" />
            </Form.Item>
            <Form.Item name="finalPrice" label={t('deals:finalPriceMillion')}>
              <InputNumber min={0} style={{ width: '100%' }} addonAfter={t('deals:million')} placeholder="VD: 480" />
            </Form.Item>
            <Form.Item name="expectedCloseDate" label={t('deals:expectedCloseDateLabel')}>
              <Input type="date" />
            </Form.Item>
            <Form.Item
              name="lostReason"
              label={t('deals:lostReasonRequiredWhenLost')}
              rules={[
                {
                  validator: (_, value) => {
                    if (form.getFieldValue('stage') === 'closed_lost' && !value?.trim()) {
                      return Promise.reject(new Error(t('deals:lostReasonRequired')))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} style={{ marginRight: 8 }}>
                {t('common:save')}
              </Button>
              <Button onClick={() => setEditing(false)}>{t('common:cancel')}</Button>
            </Form.Item>
          </Form>
        </ProCard>
      </PageContainer>
    )
  }

  const stageLabel = STAGE_OPTIONS.find((o) => o.value === deal.stage)?.label ?? deal.stage

  return (
    <div className="deal-detail-page">
    <PageContainer
      title={`Deal #${deal.id.slice(0, 8)} — ${stageLabel}`}
      onBack={() => navigate('/deals')}
      backIcon={<ArrowLeftOutlined />}
      breadcrumb={{
        items: [
          { title: <Link to="/deals">{t('deals:title')}</Link> },
          { title: `#${deal.id.slice(0, 8)}` },
        ],
      }}
      extra={[
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
          {t('common:edit')}
        </Button>,
      ]}
    >
      <ProCard title={t('deals:info')} style={{ marginBottom: 16, borderRadius: 8 }} bordered>
        <Descriptions column={2} size="small">
          <Descriptions.Item label={t('deals:stage')}><Tag color={getDealStageTagColor(deal.stage)}>{stageLabel}</Tag></Descriptions.Item>
          <Descriptions.Item label={t('deals:assignedTo')}>
            {deal.assignedTo
              ? (profiles.find((p) => p.id === deal.assignedTo)?.fullName ?? deal.assignedTo)
              : t('common:dash')}
          </Descriptions.Item>
          <Descriptions.Item label={t('deals:lead')}>
            {deal.leadId ? (
              <Link to={`/leads/${deal.leadId}`}>
                {leads.find((l) => l.id === deal.leadId)?.name ?? leads.find((l) => l.id === deal.leadId)?.phone ?? deal.leadId.slice(0, 8)}
              </Link>
            ) : (
              t('common:dash')
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('deals:vehicle')}>
            {deal.vehicleId ? (
              <Link to={`/inventory/${deal.vehicleId}`}>
                {(() => {
                  const v = vehicles.find((x) => x.id === deal.vehicleId)
                  return v ? `${v.brand} ${v.model} (${v.year})` : deal.vehicleId.slice(0, 8)
                })()}
              </Link>
            ) : (
              t('common:dash')
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('deals:customer')}>
            {deal.customerId ? (
              <Link to={`/customers/${deal.customerId}`}>
                {customers.find((c) => c.id === deal.customerId)?.name ?? deal.customerId}
              </Link>
            ) : (
              t('common:dash')
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('deals:expectedPrice')}>
            {formatPrice(deal.expectedPrice)}
          </Descriptions.Item>
          <Descriptions.Item label={t('deals:finalPrice')}>
            {formatPrice(deal.finalPrice)}
          </Descriptions.Item>
          <Descriptions.Item label={t('deals:expectedCloseDate')}>{deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : t('common:dash')}</Descriptions.Item>
          <Descriptions.Item label={t('deals:lostReason')} span={2}>{deal.lostReason ?? t('common:dash')}</Descriptions.Item>
        </Descriptions>
      </ProCard>
      <ProCard title={t('deals:timeline')} style={{ borderRadius: 8 }} bordered>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <TextArea
            rows={3}
            placeholder={t('deals:addNotePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button type="primary" onClick={handleAddNote} loading={submitting}>
            {t('deals:addNote')}
          </Button>
        </Space>
        <List
          size="small"
          style={{ marginTop: 16 }}
          dataSource={activities}
          renderItem={(item) => (
            <List.Item>
              <div>
                <strong>{item.type}</strong> — {formatDateTime(item.createdAt)}
                {item.content && <div style={{ marginTop: 4 }}>{item.content}</div>}
              </div>
            </List.Item>
          )}
        />
      </ProCard>
    </PageContainer>
    </div>
  )
}
