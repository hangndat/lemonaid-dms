import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Tag, Modal, message } from 'antd'
import { EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '../context/CurrencyContext'
import { dealsRepo, profilesRepo, leadsRepo, customersRepo, vehiclesRepo } from '../repos'
import { useIsMobile } from '../hooks/useIsMobile'
import { DealForm } from '../components/DealForm'
import type { Deal, DealStage } from '../types'
import type { Lead } from '../types'
import type { Profile } from '../types'
import type { Customer } from '../types'
import type { Vehicle } from '../types'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/format'
import { getDealStageTagColor } from '../utils/tagColors'

export function DealsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation(['deals', 'common'])
  const { user } = useAuth()
  const { formatPrice } = useCurrency()
  const isMobile = useIsMobile()
  const actionRef = useRef<ActionType>(null)

  const STAGE_OPTIONS: { value: DealStage; label: string }[] = [
    { value: 'lead', label: t('deals:stageLead') },
    { value: 'test_drive', label: t('deals:stageTestDrive') },
    { value: 'negotiation', label: t('deals:stageNegotiation') },
    { value: 'loan_processing', label: t('deals:stageLoan') },
    { value: 'closed_won', label: t('deals:stageWon') },
    { value: 'closed_lost', label: t('deals:stageLost') },
  ]
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [prefillLead, setPrefillLead] = useState<Lead | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    const state = location.state as { prefillLead?: Lead } | null
    if (state?.prefillLead) {
      setPrefillLead(state.prefillLead)
      setModalOpen(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate])

  const loadFormData = () => {
    Promise.all([
      profilesRepo.list(),
      leadsRepo.list({ pageSize: 500 }),
      customersRepo.list({ pageSize: 500 }),
      vehiclesRepo.list({ pageSize: 500 }),
    ]).then(([p, lRes, cRes, vRes]) => {
      setProfiles(p)
      setLeads(lRes.items)
      setCustomers(cRes.items)
      setVehicles(vRes.items)
    })
  }

  useEffect(() => {
    if (modalOpen && profiles.length === 0) loadFormData()
  }, [modalOpen])

  const handleCreate = async (values: Record<string, unknown>) => {
    setSaving(true)
    try {
      await dealsRepo.create({
        stage: (values.stage as DealStage) ?? 'lead',
        assignedTo: values.assignedTo as string,
        leadId: (values.leadId as string) || undefined,
        vehicleId: (values.vehicleId as string) || undefined,
        customerId: (values.customerId as string) || undefined,
        expectedPrice: values.expectedPrice as number | undefined,
        finalPrice: values.finalPrice as number | undefined,
        expectedCloseDate: (values.expectedCloseDate as string) || undefined,
        lostReason: (values.lostReason as string) || undefined,
        createdBy: user?.id,
      })
      message.success(t('deals:addedSuccess'))
      setModalOpen(false)
      setPrefillLead(null)
      actionRef.current?.reload()
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('deals:addError'))
    } finally {
      setSaving(false)
    }
  }

  const initialDeal = prefillLead
    ? {
        leadId: prefillLead.id,
        assignedTo: prefillLead.assignedTo || undefined,
        customerId: prefillLead.customerId || undefined,
        vehicleId: prefillLead.interestedVehicleId || undefined,
        stage: 'lead' as DealStage,
      }
    : null

  const columns: ProColumns<Deal>[] = [
    { dataIndex: 'stage', title: t('deals:stage'), hideInTable: true, valueType: 'select', valueEnum: Object.fromEntries(STAGE_OPTIONS.map((o) => [o.value, { text: o.label }])), fieldProps: { placeholder: t('deals:filterByStage') } },
    { dataIndex: 'stage', title: t('deals:stage'), hideInSearch: true, width: 130, valueType: 'select', valueEnum: Object.fromEntries(STAGE_OPTIONS.map((o) => [o.value, { text: o.label }])), render: (_, r) => <Tag color={getDealStageTagColor(r.stage)}>{STAGE_OPTIONS.find((o) => o.value === r.stage)?.label ?? r.stage}</Tag> },
    { dataIndex: 'id', title: 'ID', width: 100, ellipsis: true, render: (_, r) => r.id.slice(0, 8) },
    { dataIndex: 'assignedTo', title: t('deals:assignedTo'), width: 120, ellipsis: true, render: (_, r) => r.assignedTo ?? '—' },
    {
      dataIndex: 'expectedPrice',
      title: t('deals:expectedPriceTr'),
      width: 120,
      render: (_, r) => formatPrice(r.expectedPrice),
    },
    {
      dataIndex: 'finalPrice',
      title: t('deals:finalPriceTr'),
      width: 110,
      render: (_, r) => formatPrice(r.finalPrice),
    },
    { dataIndex: 'expectedCloseDate', title: t('deals:expectedCloseDate'), width: 120, render: (_, r) => (r.expectedCloseDate ? formatDate(r.expectedCloseDate) : '—') },
    {
      title: t('common:actions'),
      valueType: 'option',
      width: 90,
      fixed: 'right',
      render: (_, r) => [
        <Button type="link" size="small" key="view" icon={<EyeOutlined />} onClick={() => navigate(`/deals/${r.id}`)}>
          {t('common:view')}
        </Button>,
      ],
    },
  ]

  return (
    <div className="deals-page">
      <ProTable<Deal>
        actionRef={actionRef}
        rowKey="id"
        headerTitle={t('deals:headerTitle')}
        request={async (params) => {
          const res = await dealsRepo.list({
            filters: params.stage ? { stage: params.stage as DealStage } : undefined,
            page: params.current ?? 1,
            pageSize: params.pageSize ?? 20,
          })
          return { data: res.items, success: true, total: res.total }
        }}
        columns={columns}
        scroll={{ x: 920 }}
        search={{ labelWidth: 'auto', defaultCollapsed: isMobile }}
        form={{ initialValues: { stage: undefined } }}
        locale={{ emptyText: t('deals:emptyText') }}
        options={{ fullScreen: true, reload: true, density: true }}
        cardProps={{ bordered: true, style: { borderRadius: 8 } }}
        tableStyle={{ minWidth: 900 }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setPrefillLead(null); setModalOpen(true); loadFormData(); }}>
            {t('deals:addDeal')}
          </Button>,
        ]}
      />
      <Modal
        title={prefillLead ? t('deals:addDealFromLead') : t('deals:addDeal')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setPrefillLead(null); }}
        footer={null}
        width={560}
        destroyOnClose
      >
        <DealForm
          initial={initialDeal}
          profiles={profiles}
          leads={leads}
          customers={customers}
          vehicles={vehicles}
          onFinish={handleCreate}
          loading={saving}
          onCancel={() => { setModalOpen(false); setPrefillLead(null); }}
        />
      </Modal>
    </div>
  )
}
