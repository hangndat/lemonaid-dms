import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProCard, PageContainer } from '@ant-design/pro-components'
import { Descriptions, Button, Table, Image, Spin, Space, Input, Modal } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { vehiclesRepo } from '../repos'
import { VehicleForm } from '../components/VehicleForm'
import type { Vehicle, VehiclePhoto, VehiclePriceHistory } from '../types'
import { useAuth } from '../context/AuthContext'

export function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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
      navigate(`/inventory/${created.id}`)
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
      setEditing(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!vehicle) return
    Modal.confirm({
      title: 'Xóa xe?',
      content: `Xóa xe ${vehicle.brand} ${vehicle.model} (${vehicle.year})? Hành động không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        await vehiclesRepo.remove(vehicle.id)
        navigate('/inventory')
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
    } finally {
      setAddingPhoto(false)
    }
  }

  const handleRemovePhoto = async (photoId: string) => {
    await vehiclesRepo.removePhoto(photoId)
    if (vehicle) setPhotos(await vehiclesRepo.getPhotos(vehicle.id))
  }

  if (loading && !vehicle && id !== 'new') return <Spin size="large" style={{ display: 'block', margin: 48 }} />

  if (id === 'new') {
    return (
      <PageContainer
        title="Thêm xe mới"
        onBack={() => navigate('/inventory')}
        backIcon={<ArrowLeftOutlined />}
      >
        <VehicleForm onFinish={handleCreate} loading={saving} onCancel={() => navigate('/inventory')} />
      </PageContainer>
    )
  }

  if (!vehicle) {
    return (
      <PageContainer title="Chi tiết xe" onBack={() => navigate('/inventory')} backIcon={<ArrowLeftOutlined />}>
        <p>Không tìm thấy xe.</p>
      </PageContainer>
    )
  }

  if (editing) {
    return (
      <PageContainer
        title="Sửa xe"
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
      extra={[
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
          Sửa
        </Button>,
        <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDelete}>
          Xóa xe
        </Button>,
      ]}
    >
      {(photos.length > 0 || vehicle) && (
        <ProCard title="Ảnh xe" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Space wrap>
              <Input
                placeholder="Thêm ảnh (dán URL)"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                style={{ width: 320 }}
                onPressEnter={handleAddPhoto}
              />
              <Button type="primary" onClick={handleAddPhoto} loading={addingPhoto} icon={<PlusOutlined />}>
                Thêm ảnh
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
      <ProCard title="Thông tin" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="Trạng thái">{vehicle.status}</Descriptions.Item>
          <Descriptions.Item label="VIN">{vehicle.vin ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Hãng">{vehicle.brand}</Descriptions.Item>
          <Descriptions.Item label="Dòng">{vehicle.model}</Descriptions.Item>
          <Descriptions.Item label="Phiên bản">{vehicle.variant ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Năm">{vehicle.year}</Descriptions.Item>
          <Descriptions.Item label="Số km">{vehicle.mileage != null ? vehicle.mileage.toLocaleString() : '—'}</Descriptions.Item>
          <Descriptions.Item label="Màu">{vehicle.color ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Hộp số">{vehicle.transmission ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Nhiên liệu">{vehicle.fuelType ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Giá (VNĐ)">
            {vehicle.price != null ? (vehicle.price / 1_000_000).toFixed(0) + ' tr' : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày nhập">{vehicle.stockInDate ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>{vehicle.description ?? '—'}</Descriptions.Item>
        </Descriptions>
      </ProCard>
      <ProCard title="Lịch sử giá">
        <Table
          size="small"
          rowKey="id"
          dataSource={priceHistory}
          columns={[
            { dataIndex: 'recordedAt', title: 'Thời điểm', render: (v: string) => new Date(v).toLocaleString('vi-VN') },
            { dataIndex: 'price', title: 'Giá (VNĐ)', render: (v: number) => (v / 1_000_000).toFixed(0) + ' tr' },
            { dataIndex: 'recordedBy', title: 'Người ghi' },
          ]}
          pagination={false}
        />
      </ProCard>
    </PageContainer>
  )
}
