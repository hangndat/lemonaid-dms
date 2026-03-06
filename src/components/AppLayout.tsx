import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ProLayout, PageContainer } from '@ant-design/pro-components'
import { Button, Dropdown } from 'antd'
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

  return (
    <ProLayout
      title="DMS Lemonaid"
      logo={false}
      layout="side"
      token={{
        header: {
          colorBgHeader: '#fff',
        },
        sider: {
          colorMenuBackground: '#001529',
          colorTextMenu: 'rgba(255,255,255,0.85)',
          colorTextMenuSelected: '#fff',
          colorBgMenuItemSelected: '#1890ff',
        },
      }}
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
      avatarProps={{
        src: undefined,
        title: user?.fullName ?? user?.email,
        size: 'small',
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
          icon={<ReloadOutlined />}
          onClick={() => {
            if (window.confirm('Reset toàn bộ dữ liệu demo về seed? Bạn sẽ cần đăng nhập lại.')) {
              resetDemoData()
            }
          }}
        >
          Reset demo data
        </Button>,
      ]}
    >
      <PageContainer fixedHeader>
        <Outlet />
      </PageContainer>
    </ProLayout>
  )
}
