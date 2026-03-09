import { ProCard } from '@ant-design/pro-components'
import { Form, Input, InputNumber, Select, Button, Row, Col } from 'antd'
import { useTranslation } from 'react-i18next'
import type { Vehicle, VehicleStatus } from '../types'

const { TextArea } = Input

interface VehicleFormProps {
  initial?: Partial<Vehicle> | null
  loading?: boolean
  onFinish: (values: Record<string, unknown>) => Promise<void>
  onCancel?: () => void
}

export function VehicleForm({ initial, loading, onFinish, onCancel }: VehicleFormProps) {
  const [form] = Form.useForm()
  const { t } = useTranslation(['inventory', 'common'])

  const STATUS_OPTIONS: { value: VehicleStatus; label: string }[] = [
    { value: 'draft', label: t('inventory:statusDraft') },
    { value: 'available', label: t('inventory:statusAvailable') },
    { value: 'reserved', label: t('inventory:statusReserved') },
    { value: 'sold', label: t('inventory:statusSold') },
  ]

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
      <ProCard title={t('inventory:formTitle')} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="brand" label={t('inventory:brand')} rules={[{ required: true, message: t('inventory:brandRequired') }]}>
              <Input placeholder={t('inventory:brandPlaceholder')} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="model" label={t('inventory:model')} rules={[{ required: true, message: t('inventory:modelRequired') }]}>
              <Input placeholder={t('inventory:modelPlaceholder')} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="variant" label={t('inventory:variant')}>
              <Input placeholder={t('inventory:variantPlaceholder')} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="year" label={t('inventory:year')} rules={[{ required: true, message: t('inventory:yearRequired') }]}>
              <InputNumber min={1990} max={2030} style={{ width: '100%' }} placeholder={t('inventory:yearPlaceholder')} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="vin" label={t('inventory:vin')} tooltip={t('inventory:vinTooltip')}>
              <Input placeholder={t('inventory:vinPlaceholder')} maxLength={17} showCount />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="mileage" label={t('inventory:mileage')}>
              <InputNumber min={0} style={{ width: '100%' }} addonAfter="km" placeholder={t('inventory:mileagePlaceholder')} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="color" label={t('inventory:color')}>
              <Input placeholder={t('inventory:colorPlaceholder')} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="transmission" label={t('inventory:transmission')}>
              <Input placeholder={t('inventory:transmissionPlaceholder')} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="fuelType" label={t('inventory:fuelType')}>
              <Input placeholder={t('inventory:fuelPlaceholder')} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="stockInDate" label={t('inventory:stockInDateLabel')}>
              <Input type="date" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label={t('inventory:description')}>
              <TextArea rows={3} placeholder={t('inventory:descriptionPlaceholder')} />
            </Form.Item>
          </Col>
        </Row>
      </ProCard>
      <ProCard title={t('inventory:priceAndStatus')} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="price" label={t('inventory:priceLabel')} tooltip={t('inventory:priceTooltip')}>
              <InputNumber min={0} style={{ width: '100%' }} addonAfter={t('inventory:million')} placeholder="VD: 500" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="cost" label={t('inventory:costLabel')} tooltip={t('inventory:costTooltip')}>
              <InputNumber min={0} style={{ width: '100%' }} addonAfter={t('inventory:million')} placeholder="VD: 450" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="status" label={t('inventory:status')} rules={[{ required: true, message: t('inventory:statusRequired') }]}>
              <Select options={STATUS_OPTIONS} placeholder={t('inventory:status')} />
            </Form.Item>
          </Col>
        </Row>
      </ProCard>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
          {t('common:save')}
        </Button>
        {onCancel && (
          <Button onClick={onCancel}>{t('common:cancel')}</Button>
        )}
      </Form.Item>
    </Form>
  )
}
