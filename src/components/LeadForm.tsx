import { Form, Input, Select, Button } from 'antd'
import { useTranslation } from 'react-i18next'
import type { Lead, LeadSource, LeadStatus } from '../types'
import type { Profile } from '../types'
import type { Customer } from '../types'
import type { Vehicle } from '../types'

const { TextArea } = Input

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
  const { t } = useTranslation(['leads', 'common'])

  const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
    { value: 'facebook', label: t('leads:sourceFacebook') },
    { value: 'website', label: t('leads:sourceWebsite') },
    { value: 'marketplace', label: t('leads:sourceMarketplace') },
    { value: 'walk_in', label: t('leads:sourceWalkIn') },
    { value: 'hotline', label: t('leads:sourceHotline') },
  ]

  const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
    { value: 'new', label: t('leads:statusNew') },
    { value: 'contacted', label: t('leads:statusContacted') },
    { value: 'test_drive', label: t('leads:statusTestDrive') },
    { value: 'negotiation', label: t('leads:statusNegotiation') },
    { value: 'closed', label: t('leads:statusClosed') },
    { value: 'lost', label: t('leads:statusLost') },
  ]

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
      <Form.Item name="source" label={t('leads:source')} rules={[{ required: true, message: t('leads:sourceRequired') }]}>
        <Select options={SOURCE_OPTIONS} placeholder={t('leads:selectSource')} />
      </Form.Item>
      <Form.Item name="status" label={t('leads:status')} rules={[{ required: true, message: t('leads:statusRequired') }]}>
        <Select options={STATUS_OPTIONS} placeholder={t('leads:selectStatus')} />
      </Form.Item>
      <Form.Item name="assignedTo" label={t('leads:assignedToLabel')}>
        <Select
          allowClear
          placeholder={t('leads:selectSales')}
          options={profiles.map((p) => ({ value: p.id, label: `${p.fullName} (${p.role})` }))}
        />
      </Form.Item>
      <Form.Item name="name" label={t('leads:name')}>
        <Input placeholder={t('leads:customerNamePlaceholder')} />
      </Form.Item>
      <Form.Item name="phone" label={t('leads:phone')}>
        <Input placeholder={t('leads:phonePlaceholder')} />
      </Form.Item>
      <Form.Item name="email" label={t('leads:email')}>
        <Input type="email" placeholder={t('leads:emailPlaceholder')} />
      </Form.Item>
      <Form.Item name="customerId" label={t('leads:customerLabel')}>
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder={t('leads:selectCustomerOptional')}
          options={customers.map((c) => ({ value: c.id, label: `${c.name} — ${c.phone ?? ''}` }))}
        />
      </Form.Item>
      <Form.Item name="interestedVehicleId" label={t('leads:interestedVehicle')}>
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder={t('leads:selectVehicleOptional')}
          options={vehicles.map((v) => ({
            value: v.id,
            label: `${v.brand} ${v.model} (${v.year}) — ${v.vin ?? v.id.slice(0, 8)}`,
          }))}
        />
      </Form.Item>
      <Form.Item name="notes" label={t('leads:notes')}>
        <TextArea rows={3} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
          {t('common:save')}
        </Button>
        {onCancel && <Button onClick={onCancel}>{t('common:cancel')}</Button>}
      </Form.Item>
    </Form>
  )
}
