import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProCard } from '@ant-design/pro-components'
import { Form, Select, Button, Typography } from 'antd'
import { useAuth } from '../context/AuthContext'
import { profilesRepo } from '../repos'
import { LEMONAIDE } from '../theme/lemonaide'
import type { Profile } from '../types'

const { Title, Paragraph } = Typography

export function LoginPage() {
  const navigate = useNavigate()
  const { user, login, loading } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
      return
    }
    profilesRepo.list().then((list) => setProfiles(list))
  }, [user, navigate])

  const onFinish = async (values: { profileId: string }) => {
    setSubmitting(true)
    await login(values.profileId)
    setSubmitting(false)
    navigate('/', { replace: true })
  }

  if (user) return null

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${LEMONAIDE.contentBg} 0%, #e4e8ec 100%)`,
        padding: 24,
      }}
    >
      <ProCard style={{ width: 400 }} title={<Title level={3}>Lemonaide DMS — Đăng nhập</Title>}>
        <Paragraph type="secondary">
          Chọn tài khoản để đăng nhập. Dữ liệu lưu trong localStorage.
        </Paragraph>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="profileId"
            label="Tài khoản"
            rules={[{ required: true, message: 'Chọn một tài khoản' }]}
          >
            <Select
              placeholder="Chọn nhân viên"
              loading={loading && profiles.length === 0}
              optionFilterProp="label"
              options={profiles.map((p) => ({
                value: p.id,
                label: `${p.fullName} (${p.role}) — ${p.email}`,
              }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={submitting}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </ProCard>
    </div>
  )
}
