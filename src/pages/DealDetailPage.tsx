import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProCard, PageContainer } from '@ant-design/pro-components'
import { Descriptions, Button, Input, List, Space, Spin, Form, InputNumber, Select } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { dealsRepo } from '../repos'
import { useAuth } from '../context/AuthContext'
import type { Deal, DealActivity, DealStage } from '../types'

const { TextArea } = Input

const STAGE_OPTIONS: { value: DealStage; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'test_drive', label: 'Lái thử' },
  { value: 'negotiation', label: 'Thương lượng' },
  { value: 'loan_processing', label: 'Duyệt vay' },
  { value: 'closed_won', label: 'Thắng' },
  { value: 'closed_lost', label: 'Thua' },
]

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [activities, setActivities] = useState<DealActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

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
      setEditing(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!id || !note.trim()) return
    setSubmitting(true)
    await dealsRepo.addActivity(id, 'note', note.trim(), user?.id)
    setNote('')
    await load()
    setSubmitting(false)
  }

  if (loading && !deal) return <Spin size="large" style={{ display: 'block', margin: 48 }} />
  if (!id || !deal) {
    return (
      <PageContainer title="Chi tiết deal" onBack={() => navigate('/deals')} backIcon={<ArrowLeftOutlined />}>
        <p>Không tìm thấy deal.</p>
      </PageContainer>
    )
  }

  if (editing) {
    return (
      <PageContainer title="Sửa deal" onBack={() => setEditing(false)} backIcon={<ArrowLeftOutlined />}>
        <ProCard>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="stage" label="Giai đoạn" rules={[{ required: true }]}>
              <Select options={STAGE_OPTIONS} />
            </Form.Item>
            <Form.Item name="expectedPrice" label="Giá dự kiến (triệu VNĐ)">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="finalPrice" label="Giá chốt (triệu VNĐ)">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="expectedCloseDate" label="Ngày dự kiến chốt">
              <Input type="date" />
            </Form.Item>
            <Form.Item
              name="lostReason"
              label="Lý do thua (bắt buộc khi giai đoạn = Thua)"
              rules={[
                {
                  validator: (_, value) => {
                    if (form.getFieldValue('stage') === 'closed_lost' && !value?.trim()) {
                      return Promise.reject(new Error('Nhập lý do thua'))
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
                Lưu
              </Button>
              <Button onClick={() => setEditing(false)}>Hủy</Button>
            </Form.Item>
          </Form>
        </ProCard>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={`Deal #${deal.id.slice(0, 8)} — ${deal.stage}`}
      onBack={() => navigate('/deals')}
      backIcon={<ArrowLeftOutlined />}
      extra={[
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
          Sửa
        </Button>,
      ]}
    >
      <ProCard title="Thông tin" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="Giai đoạn">{deal.stage}</Descriptions.Item>
          <Descriptions.Item label="Người phụ trách">{deal.assignedTo}</Descriptions.Item>
          <Descriptions.Item label="Lead">{deal.leadId ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Xe">{deal.vehicleId ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Khách">{deal.customerId ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Giá dự kiến">
            {deal.expectedPrice != null ? (deal.expectedPrice / 1_000_000).toFixed(0) + ' tr' : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Giá chốt">
            {deal.finalPrice != null ? (deal.finalPrice / 1_000_000).toFixed(0) + ' tr' : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày dự kiến">{deal.expectedCloseDate ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Lý do thua" span={2}>{deal.lostReason ?? '—'}</Descriptions.Item>
        </Descriptions>
      </ProCard>
      <ProCard title="Timeline">
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
