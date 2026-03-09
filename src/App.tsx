import React from 'react'
import { ConfigProvider, Spin } from 'antd'
import enUS from 'antd/locale/en_US'
import thTH from 'antd/locale/th_TH'
import viVN from 'antd/locale/vi_VN'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LEMONAIDE } from './theme/lemonaide'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppLayout } from './components/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { InventoryPage } from './pages/InventoryPage'
import { InventoryDetailPage } from './pages/InventoryDetailPage'
import { LeadsPage } from './pages/LeadsPage'
import { LeadDetailPage } from './pages/LeadDetailPage'
import { DealsPage } from './pages/DealsPage'
import { DealDetailPage } from './pages/DealDetailPage'
import { CustomersPage } from './pages/CustomersPage'
import { CustomerDetailPage } from './pages/CustomerDetailPage'

const ANT_LOCALES: Record<string, typeof enUS> = {
  en: enUS,
  th: thTH,
  vi: viVN,
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { t } = useTranslation('common')
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip={t('loading')} />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="inventory/:id" element={<InventoryDetailPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="leads/:id" element={<LeadDetailPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="deals/:id" element={<DealDetailPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AppWithLocale() {
  const { i18n } = useTranslation()
  const antLocale = ANT_LOCALES[i18n.language] ?? ANT_LOCALES.en
  return (
    <ConfigProvider
      locale={antLocale}
      theme={{
        token: {
          colorPrimary: LEMONAIDE.colorPrimary,
          colorPrimaryHover: LEMONAIDE.colorPrimaryHover,
          fontFamily: LEMONAIDE.fontFamily,
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default function App() {
  return <AppWithLocale />
}
