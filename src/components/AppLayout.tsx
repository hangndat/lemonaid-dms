import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ProLayout } from '@ant-design/pro-components'
import { Dropdown } from 'antd'
import {
  DashboardOutlined,
  CarOutlined,
  UserAddOutlined,
  SwapOutlined,
  TeamOutlined,
  LogoutOutlined,
  GlobalOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { LEMONAIDE } from '../theme/lemonaide'
import { LANG_STORAGE_KEY } from '../i18n'

const LANG_OPTIONS = [
  { key: 'en', label: 'EN' },
  { key: 'th', label: 'TH' },
  { key: 'vi', label: 'VI' },
]

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation(['nav', 'common'])
  const { user, logout, refreshUser } = useAuth()
  const [logoError, setLogoError] = useState(false)

  const route = {
    path: '/',
    routes: [
      { path: '/', name: t('nav:overview'), icon: <DashboardOutlined /> },
      { path: '/inventory', name: t('nav:inventory'), icon: <CarOutlined /> },
      { path: '/leads', name: t('nav:leads'), icon: <UserAddOutlined /> },
      { path: '/deals', name: t('nav:deals'), icon: <SwapOutlined /> },
      { path: '/customers', name: t('nav:customers'), icon: <TeamOutlined /> },
    ],
  }

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  }

  return (
    <ProLayout
      title={t('common:appName')}
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
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>{t('common:appName')}</span>
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
      avatarProps={{
        src: undefined,
        size: 'small',
        title: user?.fullName ?? user?.email,
        render: (_, defaultDom) => (
          <Dropdown
            menu={{
              items: [
                ...LANG_OPTIONS.map((o) => ({
                  key: `lang-${o.key}`,
                  icon: i18n.language === o.key ? <GlobalOutlined /> : undefined,
                  label: o.label,
                  onClick: () => changeLang(o.key),
                })),
                { type: 'divider' as const },
                {
                  key: 'reloadData',
                  icon: <ReloadOutlined />,
                  label: t('nav:reloadData'),
                  onClick: async () => {
                    await refreshUser()
                    window.location.reload()
                  },
                },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: t('nav:logout'),
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
