import { ProCard } from '@ant-design/pro-components'
import { Form, Input, InputNumber, Select, Button, Row, Col } from 'antd'
import type { Vehicle, VehicleStatus } from '../types'

const { TextArea } = Input

const STATUS_OPTIONS: { value: VehicleStatus; label: string }[] = [
  { value: 'draft', label: 'Nháp' },
  { value: 'available', label: 'Sẵn sàng' },
  { value: 'reserved', label: 'Đã đặt' },
  { value: 'sold', label: 'Đã bán' },
]

interface VehicleFormProps {
  initial?: Partial<Vehicle> | null
  loading?: boolean
  onFinish: (values: Record<string, unknown>) => Promise<void>
  onCancel?: () => void
}

export function VehicleForm({ initial, loading, onFinish, onCancel }: VehicleFormProps) {
  const [form] = Form.useForm()

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        brand: initial?.brand ?? '',
        model: initial?.model ?? '',
        variant: initial?.variant ?? '',
        year: initial?.year ?? new Date().getFullYear(),
        vin: initial?.vin ?? '',
        mileage: initial?.mileage,
        color: initial?.color ?? '',
        transmission: initial?.transmission ?? '',
        fuelType: initial?.fuelType ?? '',
        price: initial?.price != null ? initial.price / 1_000_000 : undefined,
        cost: initial?.cost != null ? initial.cost / 1_000_000 : undefined,
        stockInDate: initial?.stockInDate ?? '',
        description: initial?.description ?? '',
        status: initial?.status ?? 'draft',
      }}
      onFinish={async (values) => {
        const payload = {
          ...values,
          price: values.price != null ? Math.round(values.price * 1_000_000) : undefined,
          cost: values.cost != null ? Math.round(values.cost * 1_000_000) : undefined,
        }
        await onFinish(payload)
      }}
    >
      <ProCard title="Thông tin xe" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="brand" label="Hãng" rules={[{ required: true }]}>
              <Input placeholder="VD: Honda" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="model" label="Dòng xe" rules={[{ required: true }]}>
              <Input placeholder="VD: City" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="variant" label="Phiên bản">
              <Input placeholder="VD: RS" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="year" label="Năm" rules={[{ required: true }]}>
              <InputNumber min={1990} max={2030} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="vin" label="VIN">
              <Input placeholder="Số VIN (tùy chọn)" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="mileage" label="Số km">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="color" label="Màu">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="transmission" label="Hộp số">
              <Input placeholder="VD: CVT, Tự động" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="fuelType" label="Nhiên liệu">
              <Input placeholder="VD: Xăng, Dầu" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="stockInDate" label="Ngày nhập kho">
              <Input type="date" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="Mô tả">
              <TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>
      </ProCard>
      <ProCard title="Giá & Trạng thái" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="price" label="Giá bán (triệu VNĐ)">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="cost" label="Giá vốn (triệu VNĐ)">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select options={STATUS_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>
      </ProCard>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
          Lưu
        </Button>
        {onCancel && (
          <Button onClick={onCancel}>Hủy</Button>
        )}
      </Form.Item>
    </Form>
  )
}
