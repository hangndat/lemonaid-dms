import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ProCard, PageContainer } from '@ant-design/pro-components'
import { Descriptions, Button, Input, List, Space, Spin, message, Empty } from 'antd'
import { ArrowLeftOutlined, EditOutlined, SwapOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { leadsRepo, profilesRepo, customersRepo, vehiclesRepo } from '../repos'
import { LeadForm } from '../components/LeadForm'
import type { Lead, LeadActivity } from '../types'
import type { Profile } from '../types'
import type { Customer } from '../types'
import type { Vehicle } from '../types'
import { useAuth } from '../context/AuthContext'

const { TextArea } = Input

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['leads', 'common'])
  const { user } = useAuth()
  const [lead, setLead] = useState<Lead | null>(null)
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const load = async () => {
    if (!id) return
    const [l, a] = await Promise.all([leadsRepo.get(id), leadsRepo.getActivities(id)])
    setLead(l ?? null)
    setActivities(a)
  }

  const loadFormData = () => {
    Promise.all([
      profilesRepo.list(),
      customersRepo.list({ pageSize: 500 }),
      vehiclesRepo.list({ pageSize: 500 }),
    ]).then(([p, cRes, vRes]) => {
      setProfiles(p)
      setCustomers(cRes.items)
      setVehicles(vRes.items)
    })
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
    if (lead) loadFormData()
  }, [lead?.id])

  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!lead) return
    setSaving(true)
    try {
      await leadsRepo.update(lead.id, {
        source: values.source as Lead['source'],
        status: values.status as Lead['status'],
        name: (values.name as string) || undefined,
        phone: (values.phone as string) || undefined,
        email: (values.email as string) || undefined,
        notes: (values.notes as string) || undefined,
        customerId: (values.customerId as string) || undefined,
        interestedVehicleId: (values.interestedVehicleId as string) || undefined,
        assignedTo: (values.assignedTo as string) || undefined,
      })
      message.success(t('leads:updatedSuccess'))
      setEditing(false)
      load()
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('leads:updateError'))
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!id || !note.trim()) return
    setSubmitting(true)
    try {
      await leadsRepo.addActivity(id, 'note', note.trim(), user?.id)
      setNote('')
      await load()
      message.success(t('leads:noteAdded'))
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('leads:noteError'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateDeal = () => {
    if (!lead) return
    navigate('/deals', { state: { prefillLead: lead } })
  }

  if (loading && !lead) return <Spin size="large" style={{ display: 'block', margin: 48 }} />
  if (!id || !lead) {
    return (
      <PageContainer title={t('leads:detailTitle')} onBack={() => navigate('/leads')} backIcon={<ArrowLeftOutlined />}>
        <Empty description={t('leads:notFound')}>
          <Button type="primary" onClick={() => navigate('/leads')}>{t('common:backToList')}</Button>
        </Empty>
      </PageContainer>
    )
  }

  if (editing) {
    return (
      <PageContainer title={t('leads:editLead')} onBack={() => setEditing(false)} backIcon={<ArrowLeftOutlined />}>
        <ProCard>
          <LeadForm
            initial={lead}
            profiles={profiles}
            customers={customers}
            vehicles={vehicles}
            loading={saving}
            onFinish={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        </ProCard>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={lead.name || lead.phone || lead.id}
      onBack={() => navigate('/leads')}
      backIcon={<ArrowLeftOutlined />}
      breadcrumb={{
        items: [
          { title: <Link to="/leads">{t('leads:title')}</Link> },
          { title: lead.name || lead.phone || lead.id },
        ],
      }}
      extra={[
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
          {t('common:edit')}
        </Button>,
        <Button key="deal" icon={<SwapOutlined />} onClick={handleCreateDeal}>
          {t('leads:createDeal')}
        </Button>,
      ]}
    >
      <ProCard title={t('leads:info')} style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label={t('leads:source')}>{lead.source}</Descriptions.Item>
          <Descriptions.Item label={t('leads:status')}>{lead.status}</Descriptions.Item>
          <Descriptions.Item label={t('leads:name')}>{lead.name ?? t('common:dash')}</Descriptions.Item>
          <Descriptions.Item label={t('leads:phone')}>{lead.phone ?? t('common:dash')}</Descriptions.Item>
          <Descriptions.Item label={t('leads:email')}>{lead.email ?? t('common:dash')}</Descriptions.Item>
          <Descriptions.Item label={t('leads:assignedToLabel')}>
            {lead.assignedTo
              ? (profiles.find((p) => p.id === lead.assignedTo)?.fullName ?? lead.assignedTo)
              : t('common:dash')}
          </Descriptions.Item>
          <Descriptions.Item label={t('leads:customer')}>
            {lead.customerId ? (
              <Link to={`/customers/${lead.customerId}`}>
                {customers.find((c) => c.id === lead.customerId)?.name ?? lead.customerId}
              </Link>
            ) : (
              t('common:dash')
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('leads:interestedVehicleLabel')}>
            {lead.interestedVehicleId ? (
              <Link to={`/inventory/${lead.interestedVehicleId}`}>
                {(() => {
                  const v = vehicles.find((x) => x.id === lead.interestedVehicleId)
                  return v ? `${v.brand} ${v.model} (${v.year})` : lead.interestedVehicleId
                })()}
              </Link>
            ) : (
              t('common:dash')
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('leads:notes')} span={2}>{lead.notes ?? t('common:dash')}</Descriptions.Item>
        </Descriptions>
      </ProCard>
      <ProCard title={t('leads:journalTitle')}>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <TextArea
            rows={3}
            placeholder={t('leads:addNotePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button type="primary" onClick={handleAddNote} loading={submitting}>
            {t('leads:addNote')}
          </Button>
        </Space>
        <List
          size="small"
          style={{ marginTop: 16 }}
          dataSource={activities}
          renderItem={(item) => (
            <List.Item>
              <div>
                <strong>{item.type}</strong> — {new Date(item.createdAt).toLocaleString('vi-VN')}
                {item.content && <div style={{ marginTop: 4 }}>{item.content}</div>}
              </div>
            </List.Item>
          )}
        />
      </ProCard>
    </PageContainer>
  )
}
