import { useNavigate } from 'react-router-dom'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Tag } from 'antd'
import { PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { vehiclesRepo } from '../repos'
import type { Vehicle, VehicleStatus } from '../types'

export function InventoryPage() {
  const navigate = useNavigate()
  const { t } = useTranslation(['inventory', 'common'])
  const actionRef = useRef<ActionType>()

  const STATUS_OPTIONS: { value: VehicleStatus; label: string }[] = [
    { value: 'draft', label: t('inventory:statusDraft') },
    { value: 'available', label: t('inventory:statusAvailable') },
    { value: 'reserved', label: t('inventory:statusReserved') },
    { value: 'sold', label: t('inventory:statusSold') },
  ]

  const columns: ProColumns<Vehicle>[] = [
    { dataIndex: 'keyword', title: t('common:search'), hideInTable: true, valueType: 'text', fieldProps: { placeholder: t('inventory:searchPlaceholder') } },
    { dataIndex: 'status', title: t('inventory:status'), width: 100, valueType: 'select', valueEnum: Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, { text: o.label }])), render: (_, r) => <Tag>{r.status}</Tag> },
    { dataIndex: 'brand', title: t('inventory:brand'), width: 100 },
    { dataIndex: 'model', title: t('inventory:model'), width: 120 },
    { dataIndex: 'year', title: t('inventory:year'), width: 70 },
    { dataIndex: 'vin', title: t('inventory:vin'), width: 140, ellipsis: true },
    {
      dataIndex: 'price',
      title: t('inventory:priceVnd'),
      width: 120,
      render: (_, r) => (r.price != null ? (r.price / 1_000_000).toFixed(0) + ' tr' : t('common:dash')),
    },
    { dataIndex: 'mileage', title: t('inventory:mileage'), width: 90, render: (_, r) => (r.mileage != null ? r.mileage.toLocaleString() : t('common:dash')) },
    { dataIndex: 'stockInDate', title: t('inventory:stockInDate'), width: 110 },
    {
      title: t('common:actions'),
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_, r) => [
        <Button type="link" size="small" key="view" icon={<EyeOutlined />} onClick={() => navigate(`/inventory/${r.id}`)}>
          {t('common:view')}
        </Button>,
      ],
    },
  ]

  return (
    <ProTable<Vehicle>
      actionRef={actionRef}
      rowKey="id"
      headerTitle={t('inventory:headerTitle')}
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
      locale={{ emptyText: t('inventory:emptyText') }}
      toolBarRender={() => [
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => navigate('/inventory/new')}>
          {t('inventory:addVehicle')}
        </Button>,
      ]}
    />
  )
}
