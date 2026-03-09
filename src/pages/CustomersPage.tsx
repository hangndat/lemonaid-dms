import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Modal, message } from 'antd'
import { EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { customersRepo } from '../repos'
import { useIsMobile } from '../hooks/useIsMobile'
import { CustomerForm } from '../components/CustomerForm'
import type { Customer } from '../types'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../utils/format'

export function CustomersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation(['customers', 'common'])
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const actionRef = useRef<ActionType>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleCreate = async (
    values: Pick<
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
  ) => {
    setSaving(true)
    try {
      await customersRepo.create({
        ...values,
        createdBy: user?.id,
      })
      message.success(t('customers:addedSuccess'))
      setModalOpen(false)
      actionRef.current?.reload()
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('customers:addError'))
    } finally {
      setSaving(false)
    }
  }

  const columns: ProColumns<Customer>[] = [
    { dataIndex: 'keyword', title: t('common:search'), hideInTable: true, valueType: 'text', fieldProps: { placeholder: t('customers:searchPlaceholder') } },
    { dataIndex: 'name', title: t('customers:name'), width: 180, ellipsis: true, render: (_, r) => <span style={{ fontWeight: 500 }}>{r.name || '—'}</span> },
    { dataIndex: 'phone', title: t('customers:phone'), width: 120, render: (_, r) => (r.phone ? <a href={`tel:${r.phone}`}>{r.phone}</a> : '—') },
    { dataIndex: 'email', title: t('customers:email'), width: 180, ellipsis: true, render: (_, r) => (r.email ? <a href={`mailto:${r.email}`}>{r.email}</a> : '—') },
    { dataIndex: 'createdAt', title: t('customers:createdAt'), width: 150, valueType: 'dateTime', render: (_, r) => (r.createdAt ? formatDateTime(r.createdAt) : '—') },
    {
      title: t('common:actions'),
      valueType: 'option',
      width: 90,
      fixed: 'right',
      render: (_, r) => [
        <Button type="link" size="small" key="view" icon={<EyeOutlined />} onClick={() => navigate(`/customers/${r.id}`)}>
          {t('common:view')}
        </Button>,
      ],
    },
  ]

  return (
    <div className="customers-page">
      <ProTable<Customer>
        actionRef={actionRef}
        rowKey="id"
        headerTitle={t('customers:headerTitle')}
        request={async (params) => {
          const res = await customersRepo.list({
            search: (params.keyword as string) ?? undefined,
            page: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
          })
          return { data: res.items, success: true, total: res.total }
        }}
        columns={columns}
        scroll={{ x: 750 }}
        search={{ labelWidth: 'auto', defaultCollapsed: isMobile }}
        locale={{ emptyText: t('customers:emptyText') }}
        options={{ fullScreen: true, reload: true, density: true }}
        cardProps={{ bordered: true, style: { borderRadius: 8 } }}
        tableStyle={{ minWidth: 700 }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            {t('customers:addCustomer')}
          </Button>,
        ]}
      />
      <Modal title={t('customers:modalTitle')} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose>
        <CustomerForm onFinish={handleCreate} loading={saving} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
