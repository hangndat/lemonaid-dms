import { Form, Input, Select, Button } from 'antd'
import type { Lead, LeadSource, LeadStatus } from '../types'
import type { Profile } from '../types'
import type { Customer } from '../types'
import type { Vehicle } from '../types'

const { TextArea } = Input

const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'website', label: 'Website' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'hotline', label: 'Hotline' },
]

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Mới' },
  { value: 'contacted', label: 'Đã liên hệ' },
  { value: 'test_drive', label: 'Lái thử' },
  { value: 'negotiation', label: 'Thương lượng' },
  { value: 'closed', label: 'Đóng' },
  { value: 'lost', label: 'Mất' },
]

interface LeadFormProps {
  initial?: Partial<Lead> | null
  loading?: boolean
  profiles: Profile[]
  customers: Customer[]
  vehicles: Vehicle[]
  onFinish: (values: Record<string, unknown>) => Promise<void>
  onCancel?: () => void
}

export function LeadForm({
  initial,
  loading,
  profiles,
  customers,
  vehicles,
  onFinish,
  onCancel,
}: LeadFormProps) {
  const [form] = Form.useForm()

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        name: initial?.name ?? '',
        phone: initial?.phone ?? '',
        email: initial?.email ?? '',
        notes: initial?.notes ?? '',
        source: initial?.source ?? 'website',
        status: initial?.status ?? 'new',
        customerId: initial?.customerId ?? undefined,
        interestedVehicleId: initial?.interestedVehicleId ?? undefined,
        assignedTo: initial?.assignedTo ?? undefined,
      }}
      onFinish={onFinish}
    >
      <Form.Item name="source" label="Nguồn" rules={[{ required: true }]}>
        <Select options={SOURCE_OPTIONS} />
      </Form.Item>
      <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
        <Select options={STATUS_OPTIONS} />
      </Form.Item>
      <Form.Item name="assignedTo" label="Người phụ trách">
        <Select
          allowClear
          placeholder="Chọn sales"
          options={profiles.map((p) => ({ value: p.id, label: `${p.fullName} (${p.role})` }))}
        />
      </Form.Item>
      <Form.Item name="name" label="Tên">
        <Input />
      </Form.Item>
      <Form.Item name="phone" label="Số điện thoại">
        <Input />
      </Form.Item>
      <Form.Item name="email" label="Email">
        <Input type="email" />
      </Form.Item>
      <Form.Item name="customerId" label="Khách hàng">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Chọn khách (tùy chọn)"
          options={customers.map((c) => ({ value: c.id, label: `${c.name} — ${c.phone ?? ''}` }))}
        />
      </Form.Item>
      <Form.Item name="interestedVehicleId" label="Xe quan tâm">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Chọn xe (tùy chọn)"
          options={vehicles.map((v) => ({
            value: v.id,
            label: `${v.brand} ${v.model} (${v.year}) — ${v.vin ?? v.id.slice(0, 8)}`,
          }))}
        />
      </Form.Item>
      <Form.Item name="notes" label="Ghi chú">
        <TextArea rows={3} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
          Lưu
        </Button>
        {onCancel && <Button onClick={onCancel}>Hủy</Button>}
      </Form.Item>
    </Form>
  )
}
