import { Form, Input, InputNumber, Select, Button } from 'antd'
import type { Deal, DealStage } from '../types'
import type { Profile } from '../types'
import type { Lead } from '../types'
import type { Customer } from '../types'
import type { Vehicle } from '../types'

const STAGE_OPTIONS: { value: DealStage; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'test_drive', label: 'Lái thử' },
  { value: 'negotiation', label: 'Thương lượng' },
  { value: 'loan_processing', label: 'Duyệt vay' },
  { value: 'closed_won', label: 'Thắng' },
  { value: 'closed_lost', label: 'Thua' },
]

interface DealFormProps {
  initial?: Partial<Deal> | null
  loading?: boolean
  profiles: Profile[]
  leads: Lead[]
  customers: Customer[]
  vehicles: Vehicle[]
  onFinish: (values: Record<string, unknown>) => Promise<void>
  onCancel?: () => void
}

export function DealForm({
  initial,
  loading,
  profiles,
  leads,
  customers,
  vehicles,
  onFinish,
  onCancel,
}: DealFormProps) {
  const [form] = Form.useForm()

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        leadId: initial?.leadId ?? undefined,
        vehicleId: initial?.vehicleId ?? undefined,
        customerId: initial?.customerId ?? undefined,
        assignedTo: initial?.assignedTo ?? undefined,
        stage: initial?.stage ?? 'lead',
        expectedPrice: initial?.expectedPrice != null ? initial.expectedPrice / 1_000_000 : undefined,
        finalPrice: initial?.finalPrice != null ? initial.finalPrice / 1_000_000 : undefined,
        expectedCloseDate: initial?.expectedCloseDate ?? undefined,
        lostReason: initial?.lostReason ?? '',
      }}
      onFinish={(values) => {
        const payload = {
          ...values,
          expectedPrice: values.expectedPrice != null ? Math.round(values.expectedPrice * 1_000_000) : undefined,
          finalPrice: values.finalPrice != null ? Math.round(values.finalPrice * 1_000_000) : undefined,
        }
        return onFinish(payload)
      }}
    >
      <Form.Item name="leadId" label="Lead">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Chọn lead"
          options={leads.map((l) => ({
            value: l.id,
            label: `${l.name || l.phone || l.id.slice(0, 8)} — ${l.source} (${l.status})`,
          }))}
        />
      </Form.Item>
      <Form.Item name="assignedTo" label="Người phụ trách" rules={[{ required: true, message: 'Chọn người phụ trách' }]}>
        <Select
          options={profiles.map((p) => ({ value: p.id, label: `${p.fullName} (${p.role})` }))}
        />
      </Form.Item>
      <Form.Item name="vehicleId" label="Xe">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Chọn xe"
          options={vehicles.map((v) => ({
            value: v.id,
            label: `${v.brand} ${v.model} (${v.year}) — ${(v.price ?? 0) / 1_000_000} tr`,
          }))}
        />
      </Form.Item>
      <Form.Item name="customerId" label="Khách hàng">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Chọn khách"
          options={customers.map((c) => ({ value: c.id, label: `${c.name} — ${c.phone ?? ''}` }))}
        />
      </Form.Item>
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
              const stage = form.getFieldValue('stage')
              if (stage === 'closed_lost' && !value?.trim()) return Promise.reject(new Error('Nhập lý do thua'))
              return Promise.resolve()
            },
          },
        ]}
      >
        <Input.TextArea rows={2} placeholder="Bắt buộc khi giai đoạn = Thua" />
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
