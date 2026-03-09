import { Form, Input, Button } from 'antd'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation(['customers', 'common'])

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
      <Form.Item name="name" label={t('customers:fullNameLabel')} rules={[{ required: true, message: t('customers:fullNameRequired') }]}>
        <Input placeholder={t('customers:fullNamePlaceholder')} />
      </Form.Item>
      <Form.Item name="phone" label={t('customers:phone')}>
        <Input placeholder={t('customers:phonePlaceholder')} />
      </Form.Item>
      <Form.Item name="email" label={t('customers:email')}>
        <Input type="email" placeholder={t('customers:emailPlaceholder')} />
      </Form.Item>
      <Form.Item name="notes" label={t('customers:notes')}>
        <TextArea rows={3} placeholder={t('customers:notesPlaceholder')} />
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
