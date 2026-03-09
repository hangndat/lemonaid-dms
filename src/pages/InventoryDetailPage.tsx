import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ProCard, PageContainer } from '@ant-design/pro-components'
import { Descriptions, Button, Table, Image, Spin, Space, Input, Modal, message, Empty } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { vehiclesRepo } from '../repos'
import { VehicleForm } from '../components/VehicleForm'
import type { Vehicle, VehiclePhoto, VehiclePriceHistory } from '../types'
import { useAuth } from '../context/AuthContext'

export function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['inventory', 'common'])
  const { user } = useAuth()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [photos, setPhotos] = useState<VehiclePhoto[]>([])
  const [priceHistory, setPriceHistory] = useState<VehiclePriceHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [addingPhoto, setAddingPhoto] = useState(false)

  const load = () => {
    if (!id || id === 'new') return
    setLoading(true)
    Promise.all([
      vehiclesRepo.get(id),
      vehiclesRepo.getPhotos(id),
      vehiclesRepo.getPriceHistory(id),
    ]).then(([v, p, h]) => {
      setVehicle(v ?? null)
      setPhotos(p)
      setPriceHistory(h)
      setLoading(false)
    })
  }

  useEffect(() => {
    if (!id || id === 'new') {
      setLoading(false)
      return
    }
    load()
  }, [id])

  const handleCreate = async (values: Record<string, unknown>) => {
    setSaving(true)
    try {
      const created = await vehiclesRepo.create({
        brand: values.brand as string,
        model: values.model as string,
        variant: (values.variant as string) || undefined,
        year: values.year as number,
        vin: (values.vin as string) || undefined,
        mileage: values.mileage as number | undefined,
        color: (values.color as string) || undefined,
        transmission: (values.transmission as string) || undefined,
        fuelType: (values.fuelType as string) || undefined,
        price: values.price as number | undefined,
        cost: values.cost as number | undefined,
        stockInDate: (values.stockInDate as string) || undefined,
        description: (values.description as string) || undefined,
        status: (values.status as Vehicle['status']) ?? 'draft',
        createdBy: user?.id,
      })
      message.success(t('inventory:addedSuccess'))
      navigate(`/inventory/${created.id}`)
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('inventory:addError'))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!vehicle) return
    setSaving(true)
    try {
      await vehiclesRepo.update(vehicle.id, {
        brand: values.brand as string,
        model: values.model as string,
        variant: (values.variant as string) || undefined,
        year: values.year as number,
        vin: (values.vin as string) || undefined,
        mileage: values.mileage as number | undefined,
        color: (values.color as string) || undefined,
        transmission: (values.transmission as string) || undefined,
        fuelType: (values.fuelType as string) || undefined,
        price: values.price as number | undefined,
        cost: values.cost as number | undefined,
        stockInDate: (values.stockInDate as string) || undefined,
        description: (values.description as string) || undefined,
        status: (values.status as Vehicle['status']) ?? 'draft',
      })
      message.success(t('inventory:updatedSuccess'))
      setEditing(false)
      load()
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('inventory:updateError'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!vehicle) return
    Modal.confirm({
      title: t('inventory:deleteConfirmTitle'),
      content: t('inventory:deleteConfirmContent', { brand: vehicle.brand, model: vehicle.model, year: vehicle.year }),
      okText: t('inventory:deleteOk'),
      okType: 'danger',
      cancelText: t('common:cancel'),
      onOk: async () => {
        try {
          await vehiclesRepo.remove(vehicle.id)
          message.success(t('inventory:deletedSuccess'))
          navigate('/inventory')
        } catch (e) {
          message.error(e instanceof Error ? e.message : t('inventory:deleteError'))
        }
      },
    })
  }

  const handleAddPhoto = async () => {
    if (!vehicle || !photoUrl.trim()) return
    setAddingPhoto(true)
    try {
      await vehiclesRepo.addPhoto(vehicle.id, photoUrl.trim(), photos.length)
      setPhotoUrl('')
      setPhotos(await vehiclesRepo.getPhotos(vehicle.id))
      message.success(t('inventory:photoAdded'))
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('inventory:photoAddError'))
    } finally {
      setAddingPhoto(false)
    }
  }

  const handleRemovePhoto = async (photoId: string) => {
    try {
      await vehiclesRepo.removePhoto(photoId)
      if (vehicle) setPhotos(await vehiclesRepo.getPhotos(vehicle.id))
      message.success(t('inventory:photoRemoved'))
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('inventory:photoRemoveError'))
    }
  }

  if (loading && !vehicle && id !== 'new') return <Spin size="large" style={{ display: 'block', margin: 48 }} />

  if (id === 'new') {
    return (
      <PageContainer
        title={t('inventory:addNew')}
        onBack={() => navigate('/inventory')}
        backIcon={<ArrowLeftOutlined />}
      >
        <VehicleForm onFinish={handleCreate} loading={saving} onCancel={() => navigate('/inventory')} />
      </PageContainer>
    )
  }

  if (!vehicle) {
    return (
      <PageContainer title={t('inventory:detail')} onBack={() => navigate('/inventory')} backIcon={<ArrowLeftOutlined />}>
        <Empty description={t('inventory:notFound')}>
          <Button type="primary" onClick={() => navigate('/inventory')}>{t('common:backToList')}</Button>
        </Empty>
      </PageContainer>
    )
  }

  if (editing) {
    return (
      <PageContainer
        title={t('inventory:editVehicle')}
        onBack={() => setEditing(false)}
        backIcon={<ArrowLeftOutlined />}
      >
        <VehicleForm
          initial={vehicle}
          loading={saving}
          onFinish={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={`${vehicle.brand} ${vehicle.model} (${vehicle.year})`}
      onBack={() => navigate('/inventory')}
      backIcon={<ArrowLeftOutlined />}
      breadcrumb={{
        items: [
          { title: <Link to="/inventory">{t('inventory:title')}</Link> },
          { title: `${vehicle.brand} ${vehicle.model} (${vehicle.year})` },
        ],
      }}
      extra={[
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
          {t('common:edit')}
        </Button>,
        <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDelete}>
          {t('inventory:deleteVehicle')}
        </Button>,
      ]}
    >
      {(photos.length > 0 || vehicle) && (
        <ProCard title={t('inventory:photosTitle')} style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Space wrap>
              <Input
                placeholder={t('inventory:addPhotoPlaceholder')}
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                style={{ width: 320 }}
                onPressEnter={handleAddPhoto}
              />
              <Button type="primary" onClick={handleAddPhoto} loading={addingPhoto} icon={<PlusOutlined />}>
                {t('inventory:addPhoto')}
              </Button>
            </Space>
            {photos.length > 0 && (
              <Image.PreviewGroup>
                <Space wrap>
                  {photos.map((p) => (
                    <div key={p.id} style={{ position: 'relative', display: 'inline-block' }}>
                      <Image src={p.url} width={160} height={120} style={{ objectFit: 'cover' }} />
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        style={{ position: 'absolute', top: 4, right: 4 }}
                        onClick={() => handleRemovePhoto(p.id)}
                      />
                    </div>
                  ))}
                </Space>
              </Image.PreviewGroup>
            )}
          </Space>
        </ProCard>
      )}
      <ProCard title={t('inventory:info')} style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label={t('inventory:status')}>{vehicle.status}</Descriptions.Item>
          <Descriptions.Item label={t('inventory:vin')}>{vehicle.vin ?? t('common:dash')}</Descriptions.Item>
          <Descriptions.Item label={t('inventory:brand')}>{vehicle.brand}</Descriptions.Item>
          <Descriptions.Item label={t('inventory:model')}>{vehicle.model}</Descriptions.Item>
          <Descriptions.Item label={t('inventory:variant')}>{vehicle.variant ?? t('common:dash')}</Descriptions.Item>
          <Descriptions.Item label={t('inventory:year')}>{vehicle.year}</Descriptions.Item>
          <Descriptions.Item label={t('inventory:mileage')}>{vehicle.mileage != null ? vehicle.mileage.toLocaleString() : t('common:dash')}</Descriptions.Item>
          <Descriptions.Item label={t('inventory:color')}>{vehicle.color ?? t('common:dash')}</Descriptions.Item>
          <Descriptions.Item label={t('inventory:transmission')}>{vehicle.transmission ?? t('common:dash')}</Descriptions.Item>
          <Descriptions.Item label={t('inventory:fuelType')}>{vehicle.fuelType ?? t('common:dash')}</Descriptions.Item>
          <Descriptions.Item label={t('inventory:priceVnd')}>
            {vehicle.price != null ? (vehicle.price / 1_000_000).toFixed(0) + ' tr' : t('common:dash')}
          </Descriptions.Item>
          <Descriptions.Item label={t('inventory:stockInDate')}>{vehicle.stockInDate ?? t('common:dash')}</Descriptions.Item>
          <Descriptions.Item label={t('inventory:description')} span={2}>{vehicle.description ?? t('common:dash')}</Descriptions.Item>
        </Descriptions>
      </ProCard>
      <ProCard title={t('inventory:priceHistory')}>
        <Table
          size="small"
          rowKey="id"
          dataSource={priceHistory}
          columns={[
            { dataIndex: 'recordedAt', title: t('inventory:recordedAt'), render: (v: string) => new Date(v).toLocaleString() },
            { dataIndex: 'price', title: t('inventory:priceVnd'), render: (v: number) => (v / 1_000_000).toFixed(0) + ' tr' },
            { dataIndex: 'recordedBy', title: t('inventory:recordedBy') },
          ]}
          pagination={false}
        />
      </ProCard>
    </PageContainer>
  )
}
