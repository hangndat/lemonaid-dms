import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProCard } from '@ant-design/pro-components'
import { Descriptions, Button, Tabs, Table, Spin, Typography } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { customersRepo, leadsRepo, dealsRepo } from '../repos'
import { CustomerForm } from '../components/CustomerForm'
import type { Customer, Lead, Deal } from '../types'

const { Title } = Typography

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = () => {
    if (!id) return
    setLoading(true)
    customersRepo.get(id).then((c) => {
      setCustomer(c ?? null)
      if (!c) {
        setLoading(false)
        return
      }
      Promise.all([
        leadsRepo.list({ pageSize: 100 }),
        dealsRepo.list({ pageSize: 100 }),
      ]).then(([lRes, dRes]) => {
        setLeads(lRes.items.filter((l) => l.customerId === id))
        setDeals(dRes.items.filter((d) => d.customerId === id))
        setLoading(false)
      })
    })
  }

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    load()
  }, [id])

  const handleUpdate = async (values: Pick<Customer, 'name' | 'phone' | 'email' | 'notes'>) => {
    if (!customer) return
    setSaving(true)
    try {
      await customersRepo.update(customer.id, values)
      setEditing(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  if (loading && !customer) return <Spin size="large" style={{ display: 'block', margin: 48 }} />
  if (!id || !customer) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')}>Quay lại</Button>
        <p>Không tìm thấy khách hàng.</p>
      </div>
    )
  }

  const purchaseHistory = deals.filter((d) => d.stage === 'closed_won')

  if (editing) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => setEditing(false)} style={{ marginBottom: 16 }}>
          Quay lại
        </Button>
        <Title level={4}>Sửa khách hàng</Title>
        <ProCard>
          <CustomerForm
            initial={customer}
            loading={saving}
            onFinish={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        </ProCard>
      </div>
    )
  }

  const tabItems = [
    {
      key: 'info',
      label: 'Thông tin',
      children: (
        <>
          <Button type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)} style={{ marginBottom: 16 }}>
            Sửa
          </Button>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Tên">{customer.name}</Descriptions.Item>
            <Descriptions.Item label="SĐT">{customer.phone ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Email">{customer.email ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>{customer.notes ?? '—'}</Descriptions.Item>
          </Descriptions>
        </>
      ),
    },
    {
      key: 'leads',
      label: `Lead (${leads.length})`,
      children: (
        <Table
          size="small"
          rowKey="id"
          dataSource={leads}
          columns={[
            { dataIndex: 'source', title: 'Nguồn' },
            { dataIndex: 'status', title: 'Trạng thái' },
            { dataIndex: 'createdAt', title: 'Tạo lúc', render: (v: string) => new Date(v).toLocaleString('vi-VN') },
            {
              title: '',
              render: (_: unknown, r: Lead) => (
                <Button type="link" size="small" onClick={() => navigate(`/leads/${r.id}`)}>
                  Xem
                </Button>
              ),
            },
          ]}
          pagination={false}
        />
      ),
    },
    {
      key: 'deals',
      label: `Deal (${deals.length})`,
      children: (
        <Table
          size="small"
          rowKey="id"
          dataSource={deals}
          columns={[
            { dataIndex: 'stage', title: 'Giai đoạn' },
            { dataIndex: 'expectedPrice', title: 'Giá dự kiến', render: (v: number) => (v != null ? (v / 1_000_000).toFixed(0) + ' tr' : '—') },
            { dataIndex: 'finalPrice', title: 'Giá chốt', render: (v: number) => (v != null ? (v / 1_000_000).toFixed(0) + ' tr' : '—') },
            {
              title: '',
              render: (_: unknown, r: Deal) => (
                <Button type="link" size="small" onClick={() => navigate(`/deals/${r.id}`)}>
                  Xem
                </Button>
              ),
            },
          ]}
          pagination={false}
        />
      ),
    },
    {
      key: 'purchase',
      label: `Lịch sử mua (${purchaseHistory.length})`,
      children: (
        <Table
          size="small"
          rowKey="id"
          dataSource={purchaseHistory}
          columns={[
            { dataIndex: 'vehicleId', title: 'Xe' },
            { dataIndex: 'finalPrice', title: 'Giá chốt (VNĐ)', render: (v: number) => (v != null ? (v / 1_000_000).toFixed(0) + ' tr' : '—') },
            { dataIndex: 'updatedAt', title: 'Cập nhật', render: (v: string) => new Date(v).toLocaleString('vi-VN') },
          ]}
          pagination={false}
        />
      ),
    },
  ]

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')} style={{ marginBottom: 16 }}>
        Quay lại
      </Button>
      <Title level={4}>{customer.name}</Title>
      <Tabs items={tabItems} />
    </div>
  )
}
