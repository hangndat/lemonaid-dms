import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Tag, Modal, message } from 'antd'
import { EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { leadsRepo, profilesRepo, customersRepo, vehiclesRepo } from '../repos'
import { useIsMobile } from '../hooks/useIsMobile'
import { LeadForm } from '../components/LeadForm'
import type { Lead, LeadStatus, LeadSource } from '../types'
import type { Profile } from '../types'
import type { Customer } from '../types'
import type { Vehicle } from '../types'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../utils/format'
import { getLeadStatusTagColor, getLeadSourceTagColor } from '../utils/tagColors'

export function LeadsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation(['leads', 'common'])
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const actionRef = useRef<ActionType>(null)

  const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
    { value: 'new', label: t('leads:statusNew') },
    { value: 'contacted', label: t('leads:statusContacted') },
    { value: 'test_drive', label: t('leads:statusTestDrive') },
    { value: 'negotiation', label: t('leads:statusNegotiation') },
    { value: 'closed', label: t('leads:statusClosed') },
    { value: 'lost', label: t('leads:statusLost') },
  ]

  const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
    { value: 'facebook', label: t('leads:sourceFacebook') },
    { value: 'website', label: t('leads:sourceWebsite') },
    { value: 'marketplace', label: t('leads:sourceMarketplace') },
    { value: 'walk_in', label: t('leads:sourceWalkIn') },
    { value: 'hotline', label: t('leads:sourceHotline') },
  ]

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
      message.success(t('leads:addedSuccess'))
      setModalOpen(false)
      actionRef.current?.reload()
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('leads:addError'))
    } finally {
      setSaving(false)
    }
  }

  const columns: ProColumns<Lead>[] = [
    { dataIndex: 'keyword', title: t('common:search'), hideInTable: true, valueType: 'text', fieldProps: { placeholder: t('leads:searchPlaceholder') } },
    { dataIndex: 'status', title: t('leads:status'), hideInTable: true, valueType: 'select', valueEnum: Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, { text: o.label }])), fieldProps: { placeholder: t('leads:filterByStatus') } },
    { dataIndex: 'source', title: t('leads:source'), hideInTable: true, valueType: 'select', valueEnum: Object.fromEntries(SOURCE_OPTIONS.map((o) => [o.value, { text: o.label }])), fieldProps: { placeholder: t('leads:filterBySource') } },
    { dataIndex: 'status', title: t('leads:status'), hideInSearch: true, width: 118, valueType: 'select', valueEnum: Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, { text: o.label }])), render: (_, r) => <Tag color={getLeadStatusTagColor(r.status)}>{STATUS_OPTIONS.find((o) => o.value === r.status)?.label ?? r.status}</Tag> },
    { dataIndex: 'source', title: t('leads:source'), hideInSearch: true, width: 100, valueType: 'select', valueEnum: Object.fromEntries(SOURCE_OPTIONS.map((o) => [o.value, { text: o.label }])), render: (_, r) => <Tag color={getLeadSourceTagColor(r.source)}>{SOURCE_OPTIONS.find((o) => o.value === r.source)?.label ?? r.source}</Tag> },
    { dataIndex: 'name', title: t('leads:name'), width: 140, ellipsis: true, render: (_, r) => <span style={{ fontWeight: 500 }}>{r.name || '—'}</span> },
    { dataIndex: 'phone', title: t('leads:phone'), width: 120, render: (_, r) => r.phone ? <a href={`tel:${r.phone}`}>{r.phone}</a> : '—' },
    { dataIndex: 'assignedTo', title: t('leads:assignedTo'), width: 110, ellipsis: true, render: (_, r) => r.assignedTo ?? '—' },
    { dataIndex: 'createdAt', title: t('leads:createdAt'), width: 150, valueType: 'dateTime', render: (_, r) => r.createdAt ? formatDateTime(r.createdAt) : '—' },
    {
      title: t('common:actions'),
      valueType: 'option',
      width: 90,
      fixed: 'right',
      render: (_, r) => [
        <Button type="link" size="small" key="view" icon={<EyeOutlined />} onClick={() => navigate(`/leads/${r.id}`)}>
          {t('common:view')}
        </Button>,
      ],
    },
  ]

  return (
    <div className="leads-page">
      <ProTable<Lead>
        actionRef={actionRef}
        rowKey="id"
        headerTitle={t('leads:headerTitle')}
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
        scroll={{ x: 920 }}
        search={{ labelWidth: 'auto', defaultCollapsed: isMobile }}
        form={{ initialValues: { status: undefined, source: undefined } }}
        locale={{ emptyText: t('leads:emptyText') }}
        options={{ fullScreen: true, reload: true, density: true }}
        cardProps={{ bordered: true, style: { borderRadius: 8 } }}
        tableStyle={{ minWidth: 900 }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setModalOpen(true); loadFormData(); }}>
            {t('leads:addLead')}
          </Button>,
        ]}
      />
      <Modal title={t('leads:modalTitle')} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={520} destroyOnClose>
        <LeadForm profiles={profiles} customers={customers} vehicles={vehicles} onFinish={handleCreate} loading={saving} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
