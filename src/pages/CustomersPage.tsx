import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Modal } from 'antd'
import { EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { customersRepo } from '../repos'
import { CustomerForm } from '../components/CustomerForm'
import type { Customer } from '../types'
import { useAuth } from '../context/AuthContext'

export function CustomersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const actionRef = useRef<ActionType>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleCreate = async (values: Pick<Customer, 'name' | 'phone' | 'email' | 'notes'>) => {
    setSaving(true)
    try {
      await customersRepo.create({
        ...values,
        createdBy: user?.id,
      })
      setModalOpen(false)
      actionRef.current?.reload()
    } finally {
      setSaving(false)
    }
  }

  const columns: ProColumns<Customer>[] = [
    { dataIndex: 'keyword', title: 'Tìm kiếm', hideInTable: true, valueType: 'text', fieldProps: { placeholder: 'Tên, SĐT, email...' } },
    { dataIndex: 'name', title: 'Tên', width: 180 },
    { dataIndex: 'phone', title: 'SĐT', width: 120 },
    { dataIndex: 'email', title: 'Email', width: 180, ellipsis: true },
    { dataIndex: 'createdAt', title: 'Tạo lúc', width: 150, valueType: 'dateTime', render: (_, r) => new Date(r.createdAt).toLocaleString('vi-VN') },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 80,
      render: (_, r) => [
        <Button type="link" size="small" key="view" icon={<EyeOutlined />} onClick={() => navigate(`/customers/${r.id}`)}>
          Xem
        </Button>,
      ],
    },
  ]

  return (
    <>
      <ProTable<Customer>
        actionRef={actionRef}
        rowKey="id"
        headerTitle="Khách hàng"
        request={async (params) => {
          const res = await customersRepo.list({
            search: (params.keyword as string) ?? undefined,
            page: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
          })
          return { data: res.items, success: true, total: res.total }
        }}
        columns={columns}
        search={{ labelWidth: 'auto', defaultCollapsed: false }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Thêm khách
          </Button>,
        ]}
      />
      <Modal title="Thêm khách hàng" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose>
        <CustomerForm onFinish={handleCreate} loading={saving} onCancel={() => setModalOpen(false)} />
      </Modal>
    </>
  )
}
