import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Tag, Modal } from 'antd'
import { EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { leadsRepo, profilesRepo, customersRepo, vehiclesRepo } from '../repos'
import { LeadForm } from '../components/LeadForm'
import type { Lead, LeadStatus, LeadSource } from '../types'
import type { Profile } from '../types'
import type { Customer } from '../types'
import type { Vehicle } from '../types'
import { useAuth } from '../context/AuthContext'

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Mới' },
  { value: 'contacted', label: 'Đã liên hệ' },
  { value: 'test_drive', label: 'Lái thử' },
  { value: 'negotiation', label: 'Thương lượng' },
  { value: 'closed', label: 'Đóng' },
  { value: 'lost', label: 'Mất' },
]

const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'website', label: 'Website' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'hotline', label: 'Hotline' },
]

export function LeadsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const actionRef = useRef<ActionType>(null)

  const loadFormData = () => {
    Promise.all([
      profilesRepo.list(),
      customersRepo.list({ pageSize: 500 }),
      vehiclesRepo.list({ pageSize: 500 }),
    ]).then(([p, cRes, vRes]) => {
      setProfiles(p)
      setCustomers(cRes.items)
      setVehicles(vRes.items)
    })
  }

  const handleCreate = async (values: Record<string, unknown>) => {
    setSaving(true)
    try {
      await leadsRepo.create({
        source: values.source as Lead['source'],
        status: values.status as Lead['status'],
        name: (values.name as string) || undefined,
        phone: (values.phone as string) || undefined,
        email: (values.email as string) || undefined,
        notes: (values.notes as string) || undefined,
        customerId: (values.customerId as string) || undefined,
        interestedVehicleId: (values.interestedVehicleId as string) || undefined,
        assignedTo: (values.assignedTo as string) || undefined,
        createdBy: user?.id,
      })
      setModalOpen(false)
      actionRef.current?.reload()
    } finally {
      setSaving(false)
    }
  }

  const columns: ProColumns<Lead>[] = [
    { dataIndex: 'keyword', title: 'Tìm kiếm', hideInTable: true, valueType: 'text', fieldProps: { placeholder: 'Tên, SĐT, email...' } },
    { dataIndex: 'status', title: 'Trạng thái', width: 110, valueType: 'select', valueEnum: Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, { text: o.label }])), render: (_, r) => <Tag>{r.status}</Tag> },
    { dataIndex: 'source', title: 'Nguồn', width: 100, valueType: 'select', valueEnum: Object.fromEntries(SOURCE_OPTIONS.map((o) => [o.value, { text: o.label }])), render: (_, r) => <Tag>{r.source}</Tag> },
    { dataIndex: 'name', title: 'Tên', width: 140 },
    { dataIndex: 'phone', title: 'SĐT', width: 110 },
    { dataIndex: 'assignedTo', title: 'Assign', width: 100, ellipsis: true },
    { dataIndex: 'createdAt', title: 'Tạo lúc', width: 150, valueType: 'dateTime', render: (_, r) => new Date(r.createdAt!).toLocaleString('vi-VN') },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 80,
      render: (_, r) => [
        <Button type="link" size="small" key="view" icon={<EyeOutlined />} onClick={() => navigate(`/leads/${r.id}`)}>
          Xem
        </Button>,
      ],
    },
  ]

  return (
    <>
      <ProTable<Lead>
        actionRef={actionRef}
        rowKey="id"
        headerTitle="Lead"
        request={async (params) => {
          const filters: Record<string, string> = {}
          if (params.status) filters.status = params.status as string
          if (params.source) filters.source = params.source as string
          const res = await leadsRepo.list({
            search: (params.keyword as string) ?? undefined,
            filters: Object.keys(filters).length ? filters : undefined,
            page: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
          })
          return { data: res.items, success: true, total: res.total }
        }}
        columns={columns}
        search={{ labelWidth: 'auto', defaultCollapsed: false }}
        form={{ initialValues: { status: undefined, source: undefined } }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setModalOpen(true); loadFormData(); }}>
            Thêm lead
          </Button>,
        ]}
      />
      <Modal title="Thêm lead" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={520} destroyOnClose>
        <LeadForm profiles={profiles} customers={customers} vehicles={vehicles} onFinish={handleCreate} loading={saving} onCancel={() => setModalOpen(false)} />
      </Modal>
    </>
  )
}
