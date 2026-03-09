import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ProLayout } from '@ant-design/pro-components'
import { Button, Dropdown, Space, Typography } from 'antd'
import {
  DashboardOutlined,
  CarOutlined,
  UserAddOutlined,
  SwapOutlined,
  TeamOutlined,
  LogoutOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { LEMONAIDE } from '../theme/lemonaide'

const { Text } = Typography

const route = {
  path: '/',
  routes: [
    { path: '/', name: 'Tổng quan', icon: <DashboardOutlined /> },
    { path: '/inventory', name: 'Kho xe', icon: <CarOutlined /> },
    { path: '/leads', name: 'Lead', icon: <UserAddOutlined /> },
    { path: '/deals', name: 'Deal / Pipeline', icon: <SwapOutlined /> },
    { path: '/customers', name: 'Khách hàng', icon: <TeamOutlined /> },
  ],
}

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, resetDemoData } = useAuth()
  const [logoError, setLogoError] = useState(false)

  return (
    <ProLayout
      title="Lemonaide DMS"
      logo={
        logoError ? (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: LEMONAIDE.colorPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            L
          </div>
        ) : (
          <img
            src={LEMONAIDE.logoUrl}
            alt="Lemonaide"
            style={{ height: 32, width: 32, minWidth: 32, objectFit: 'contain', display: 'block' }}
            onError={() => setLogoError(true)}
          />
        )
      }
      layout="side"
      siderWidth={220}
      fixSiderbar
      token={{
        header: {
          colorBgHeader: '#fff',
          colorHeaderTitle: 'rgba(0, 0, 0, 0.85)',
        },
        sider: {
          colorMenuBackground: LEMONAIDE.siderBg,
          colorTextMenu: LEMONAIDE.siderText,
          colorTextMenuSelected: LEMONAIDE.siderSelectedText,
          colorBgMenuItemSelected: LEMONAIDE.siderSelectedBg,
          colorTextCollapsedButton: 'rgba(255, 255, 255, 0.7)',
          colorTextMenuTitle: '#fff',
        },
      }}
      menuHeaderRender={(logo) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 48 }}>
          {logo}
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Lemonaide DMS</span>
        </div>
      )}
      route={route}
      location={{ pathname: location.pathname }}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => navigate(item.path || '/')}
          style={{ cursor: 'pointer' }}
        >
          {dom}
        </div>
      )}
      headerContentRender={() => (
        <Space size="middle" style={{ marginLeft: 16 }}>
          <Text strong style={{ color: 'rgba(0,0,0,0.85)' }}>
            {user?.fullName ?? user?.email}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user?.role}
          </Text>
        </Space>
      )}
      avatarProps={{
        src: undefined,
        size: 'small',
        title: user?.fullName ?? user?.email,
        render: (_, defaultDom) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Đăng xuất',
                  onClick: logout,
                },
              ],
            }}
            placement="bottomRight"
          >
            {defaultDom}
          </Dropdown>
        ),
      }}
      actionsRender={() => [
        <Button
          key="reset"
          type="default"
          size="small"
          icon={<ReloadOutlined />}
          onClick={() => {
            if (window.confirm('Reset toàn bộ dữ liệu demo về seed? Bạn sẽ cần đăng nhập lại.')) {
              resetDemoData()
            }
          }}
        >
          Reset demo
        </Button>,
      ]}
      contentStyle={{
        padding: 24,
        margin: 0,
        minHeight: 'calc(100vh - 48px)',
        background: LEMONAIDE.contentBg,
      }}
    >
      <Outlet />
    </ProLayout>
  )
}
