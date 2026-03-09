import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProCard, PageContainer } from '@ant-design/pro-components'
import { Descriptions, Button, Input, List, Space, Spin } from 'antd'
import { ArrowLeftOutlined, EditOutlined, SwapOutlined } from '@ant-design/icons'
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
    if (editing) loadFormData()
  }, [editing])

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
      setEditing(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!id || !note.trim()) return
    setSubmitting(true)
    await leadsRepo.addActivity(id, 'note', note.trim(), user?.id)
    setNote('')
    await load()
    setSubmitting(false)
  }

  const handleCreateDeal = () => {
    if (!lead) return
    navigate('/deals', { state: { prefillLead: lead } })
  }

  if (loading && !lead) return <Spin size="large" style={{ display: 'block', margin: 48 }} />
  if (!id || !lead) {
    return (
      <PageContainer title="Chi tiết lead" onBack={() => navigate('/leads')} backIcon={<ArrowLeftOutlined />}>
        <p>Không tìm thấy lead.</p>
      </PageContainer>
    )
  }

  if (editing) {
    return (
      <PageContainer title="Sửa lead" onBack={() => setEditing(false)} backIcon={<ArrowLeftOutlined />}>
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
      extra={[
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
          Sửa
        </Button>,
        <Button key="deal" icon={<SwapOutlined />} onClick={handleCreateDeal}>
          Tạo deal
        </Button>,
      ]}
    >
      <ProCard title="Thông tin" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="Nguồn">{lead.source}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{lead.status}</Descriptions.Item>
          <Descriptions.Item label="Tên">{lead.name ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="SĐT">{lead.phone ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Email">{lead.email ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Assign">{lead.assignedTo ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Khách hàng">{lead.customerId ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Xe quan tâm">{lead.interestedVehicleId ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>{lead.notes ?? '—'}</Descriptions.Item>
        </Descriptions>
      </ProCard>
      <ProCard title="Nhật ký / Ghi chú">
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <TextArea
            rows={3}
            placeholder="Thêm ghi chú..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button type="primary" onClick={handleAddNote} loading={submitting}>
            Thêm ghi chú
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
