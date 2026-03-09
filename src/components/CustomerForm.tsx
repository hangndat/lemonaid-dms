import { Form, Input, Button, Row, Col } from 'antd'
import { useTranslation } from 'react-i18next'
import type { Customer } from '../types'

const { TextArea } = Input

type CustomerFormValues = Pick<
  Customer,
  | 'name'
  | 'phone'
  | 'email'
  | 'address'
  | 'addressLine2'
  | 'city'
  | 'state'
  | 'postCode'
  | 'country'
  | 'taxId'
  | 'companyRegNo'
  | 'website'
  | 'notes'
>

interface CustomerFormProps {
  initial?: Partial<Customer> | null
  loading?: boolean
  onFinish: (values: CustomerFormValues) => Promise<void>
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
        address: initial?.address ?? '',
        addressLine2: initial?.addressLine2 ?? '',
        city: initial?.city ?? '',
        state: initial?.state ?? '',
        postCode: initial?.postCode ?? '',
        country: initial?.country ?? '',
        taxId: initial?.taxId ?? '',
        companyRegNo: initial?.companyRegNo ?? '',
        website: initial?.website ?? '',
        notes: initial?.notes ?? '',
      }}
      onFinish={onFinish}
    >
      <Form.Item name="name" label={t('customers:fullNameLabel')} rules={[{ required: true, message: t('customers:fullNameRequired') }]}>
        <Input placeholder={t('customers:fullNamePlaceholder')} />
      </Form.Item>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="phone" label={t('customers:phone')}>
            <Input placeholder={t('customers:phonePlaceholder')} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="email" label={t('customers:email')}>
            <Input type="email" placeholder={t('customers:emailPlaceholder')} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="address" label={t('customers:address')}>
        <Input placeholder={t('customers:addressPlaceholder')} />
      </Form.Item>
      <Form.Item name="addressLine2" label={t('customers:addressLine2')}>
        <Input placeholder={t('customers:addressLine2Placeholder')} />
      </Form.Item>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="city" label={t('customers:city')}>
            <Input placeholder={t('customers:cityPlaceholder')} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="state" label={t('customers:state')}>
            <Input placeholder={t('customers:statePlaceholder')} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="postCode" label={t('customers:postCode')}>
            <Input placeholder={t('customers:postCodePlaceholder')} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="country" label={t('customers:country')}>
            <Input placeholder={t('customers:countryPlaceholder')} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="taxId" label={t('customers:taxId')}>
            <Input placeholder={t('customers:taxIdPlaceholder')} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="companyRegNo" label={t('customers:companyRegNo')}>
            <Input placeholder={t('customers:companyRegNoPlaceholder')} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="website" label={t('customers:website')}>
            <Input type="url" placeholder={t('customers:websitePlaceholder')} />
          </Form.Item>
        </Col>
      </Row>
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
