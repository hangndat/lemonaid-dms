import { useNavigate } from 'react-router-dom'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Tag } from 'antd'
import { PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { useRef } from 'react'
import { vehiclesRepo } from '../repos'
import type { Vehicle, VehicleStatus } from '../types'

const STATUS_OPTIONS: { value: VehicleStatus; label: string }[] = [
  { value: 'draft', label: 'Nháp' },
  { value: 'available', label: 'Sẵn sàng' },
  { value: 'reserved', label: 'Đã đặt' },
  { value: 'sold', label: 'Đã bán' },
]

export function InventoryPage() {
  const navigate = useNavigate()
  const actionRef = useRef<ActionType>()

  const columns: ProColumns<Vehicle>[] = [
    { dataIndex: 'keyword', title: 'Tìm kiếm', hideInTable: true, valueType: 'text', fieldProps: { placeholder: 'VIN, hãng, dòng...' } },
    { dataIndex: 'status', title: 'Trạng thái', width: 100, valueType: 'select', valueEnum: Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, { text: o.label }])), render: (_, r) => <Tag>{r.status}</Tag> },
    { dataIndex: 'brand', title: 'Hãng', width: 100 },
    { dataIndex: 'model', title: 'Dòng', width: 120 },
    { dataIndex: 'year', title: 'Năm', width: 70 },
    { dataIndex: 'vin', title: 'VIN', width: 140, ellipsis: true },
    {
      dataIndex: 'price',
      title: 'Giá (VNĐ)',
      width: 120,
      render: (_, r) => (r.price != null ? (r.price / 1_000_000).toFixed(0) + ' tr' : '—'),
    },
    { dataIndex: 'mileage', title: 'Số km', width: 90, render: (_, r) => (r.mileage != null ? r.mileage.toLocaleString() : '—') },
    { dataIndex: 'stockInDate', title: 'Ngày nhập', width: 110 },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_, r) => [
        <Button type="link" size="small" key="view" icon={<EyeOutlined />} onClick={() => navigate(`/inventory/${r.id}`)}>
          Xem
        </Button>,
      ],
    },
  ]

  return (
    <ProTable<Vehicle>
      actionRef={actionRef}
      rowKey="id"
      headerTitle="Kho xe"
      request={async (params) => {
        const res = await vehiclesRepo.list({
          search: (params.keyword as string) ?? undefined,
          filters: params.status ? { status: params.status as VehicleStatus } : undefined,
          page: params.current ?? 1,
          pageSize: params.pageSize ?? 20,
          sort: { field: 'updatedAt', order: 'desc' },
        })
        return { data: res.items, success: true, total: res.total }
      }}
      columns={columns}
      scroll={{ x: 900 }}
      search={{
        labelWidth: 'auto',
        defaultCollapsed: false,
      }}
      form={{
        initialValues: { status: undefined },
      }}
      toolBarRender={() => [
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => navigate('/inventory/new')}>
          Thêm xe
        </Button>,
      ]}
    />
  )
}
