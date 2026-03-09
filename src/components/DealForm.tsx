import { Form, Input, InputNumber, Select, Button } from 'antd'
import { useTranslation } from 'react-i18next'
import type { Deal, DealStage } from '../types'
import type { Profile } from '../types'
import type { Lead } from '../types'
import type { Customer } from '../types'
import type { Vehicle } from '../types'

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
  const { t } = useTranslation(['deals', 'common'])

  const STAGE_OPTIONS: { value: DealStage; label: string }[] = [
    { value: 'lead', label: t('deals:stageLead') },
    { value: 'test_drive', label: t('deals:stageTestDrive') },
    { value: 'negotiation', label: t('deals:stageNegotiation') },
    { value: 'loan_processing', label: t('deals:stageLoan') },
    { value: 'closed_won', label: t('deals:stageWon') },
    { value: 'closed_lost', label: t('deals:stageLost') },
  ]

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
      <Form.Item name="leadId" label={t('deals:lead')}>
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder={t('deals:selectLead')}
          options={leads.map((l) => ({
            value: l.id,
            label: `${l.name || l.phone || l.id.slice(0, 8)} — ${l.source} (${l.status})`,
          }))}
        />
      </Form.Item>
      <Form.Item name="assignedTo" label={t('deals:assignedTo')} rules={[{ required: true, message: t('deals:assignedToRequired') }]}>
        <Select
          options={profiles.map((p) => ({ value: p.id, label: `${p.fullName} (${p.role})` }))}
        />
      </Form.Item>
      <Form.Item name="vehicleId" label={t('deals:vehicle')}>
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder={t('deals:selectVehicle')}
          options={vehicles.map((v) => ({
            value: v.id,
            label: `${v.brand} ${v.model} (${v.year}) — ${(v.price ?? 0) / 1_000_000} tr`,
          }))}
        />
      </Form.Item>
      <Form.Item name="customerId" label={t('deals:customer')}>
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder={t('deals:selectCustomer')}
          options={customers.map((c) => ({ value: c.id, label: `${c.name} — ${c.phone ?? ''}` }))}
        />
      </Form.Item>
      <Form.Item name="stage" label={t('deals:stage')} rules={[{ required: true, message: t('deals:stageRequired') }]}>
        <Select options={STAGE_OPTIONS} placeholder={t('deals:selectStage')} />
      </Form.Item>
      <Form.Item name="expectedPrice" label={t('deals:expectedPrice')} tooltip={t('deals:expectedPriceMillion')}>
        <InputNumber min={0} style={{ width: '100%' }} addonAfter={t('deals:million')} placeholder="VD: 500" />
      </Form.Item>
      <Form.Item name="finalPrice" label={t('deals:finalPrice')} tooltip={t('deals:finalPriceMillion')}>
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
              const stage = form.getFieldValue('stage')
              if (stage === 'closed_lost' && !value?.trim()) return Promise.reject(new Error(t('deals:lostReasonRequired')))
              return Promise.resolve()
            },
          },
        ]}
      >
        <Input.TextArea rows={2} placeholder={t('deals:lostReasonPlaceholder')} />
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
