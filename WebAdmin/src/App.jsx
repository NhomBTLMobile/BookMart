import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme as antTheme, App as AntApp } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './components/Layout/MainLayout'
import ErrorBoundary from './components/ErrorBoundary'

import LoginPage      from './pages/Login/LoginPage'
import DashboardPage  from './pages/Dashboard/DashboardPage'
import UsersPage      from './pages/Users/UsersPage'
import BooksPage      from './pages/Books/BooksPage'
import AuthorsPage    from './pages/Authors/AuthorsPage'
import CategoriesPage from './pages/Categories/CategoriesPage'
import OrdersPage     from './pages/Orders/OrdersPage'
import VouchersPage   from './pages/Vouchers/VouchersPage'
import ReviewsPage    from './pages/Reviews/ReviewsPage'
import CombosPage     from './pages/Combos/CombosPage'
import ReportsPage    from './pages/Reports/ReportsPage'

const getThemeTokens = (isDark) => {
  const common = {
    colorInfo: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14', 
    colorError: '#ff4d4f',   
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
  };

  if (isDark) {
    return {
      ...common,
      colorPrimary: '#34D399', 
      colorBgLayout: '#18181B',
      colorBgContainer: '#27272A',
      colorBgElevated: '#27272A',
      colorTextBase: '#F3F4F6',
      colorTextSecondary: '#A1A1AA',
      colorBorder: '#3F3F46',
      colorBorderSecondary: '#3F3F46'
    };
  }

  return {
    ...common,
    colorPrimary: '#059669', 
    colorBgLayout: '#F9FAFB',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorTextBase: '#1F2937',
    colorTextSecondary: '#475569',
    colorBorder: '#E5E7EB',
    colorBorderSecondary: '#F1F5F9'
  };
}

function AdminRoutes() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
      <MainLayout>
        <Routes>
          <Route path="/"           element={<DashboardPage />} />
          <Route path="/reports"    element={<ReportsPage />} />
          <Route path="/books"      element={<BooksPage />} />
          <Route path="/authors"    element={<AuthorsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/combos"     element={<CombosPage />} />
          <Route path="/orders"     element={<OrdersPage />} />
          <Route path="/reviews"    element={<ReviewsPage />} />
          <Route path="/users"    element={
            <ProtectedRoute allowedRoles={['ADMIN']}><UsersPage /></ProtectedRoute>
          } />
          <Route path="/vouchers" element={
            <ProtectedRoute allowedRoles={['ADMIN']}><VouchersPage /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </ProtectedRoute>
  )
}

function ThemedApp() {
  const { isDark } = useAuth()
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: getThemeTokens(isDark),
        components: {
          Menu: {
            itemBorderRadius: 8,
            subMenuItemBorderRadius: 8,
          },
          Layout: {
            siderBg: isDark ? '#18181B' : '#FFFFFF',
            headerBg: isDark ? '#18181B' : '#FFFFFF',
          },
          Table: {
            borderRadius: 12,
          },
        },
      }}
    >
      <AntApp>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*"     element={<AdminRoutes />} />
        </Routes>
      </AntApp>
    </ConfigProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ThemedApp />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}
