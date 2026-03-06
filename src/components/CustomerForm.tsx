import { Form, Input, Button } from 'antd'
import type { Customer } from '../types'

const { TextArea } = Input

interface CustomerFormProps {
  initial?: Partial<Customer> | null
  loading?: boolean
  onFinish: (values: Pick<Customer, 'name' | 'phone' | 'email' | 'notes'>) => Promise<void>
  onCancel?: () => void
}

export function CustomerForm({ initial, loading, onFinish, onCancel }: CustomerFormProps) {
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
      }}
      onFinish={onFinish}
    >
      <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
        <Input placeholder="Họ và tên" />
      </Form.Item>
      <Form.Item name="phone" label="Số điện thoại">
        <Input placeholder="VD: 0901234567" />
      </Form.Item>
      <Form.Item name="email" label="Email">
        <Input type="email" placeholder="email@example.com" />
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
