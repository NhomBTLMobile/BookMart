import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme as antTheme, App as AntApp } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './components/Layout/MainLayout'

import LoginPage      from './pages/Login/LoginPage'
import DashboardPage  from './pages/Dashboard/DashboardPage'
import UsersPage      from './pages/Users/UsersPage'
import BooksPage      from './pages/Books/BooksPage'
import AuthorsPage    from './pages/Authors/AuthorsPage'
import CategoriesPage from './pages/Categories/CategoriesPage'
import OrdersPage     from './pages/Orders/OrdersPage'
import VouchersPage   from './pages/Vouchers/VouchersPage'
import ReviewsPage    from './pages/Reviews/ReviewsPage'

const getThemeTokens = (isDark) => {
  const common = {
    colorPrimary: '#689f38', // Darker banana-leaf green (Yellow-Green)
    colorInfo: '#689f38',
    colorSuccess: '#689f38',
    colorWarning: '#D07646', 
    colorError: '#EF4444',   
    colorLink: '#689f38', 
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
  };

  if (isDark) {
    return {
      ...common,
      colorPrimary: '#8bc34a', // Brighter banana-leaf green for dark mode
    };
  }

  return {
    ...common,
    colorBgLayout: '#F4F7F6', // Clean light gray-green for app background
    colorBgContainer: '#FFFFFF', // Pure white for cards/tables
    colorBgElevated: '#FFFFFF',
    colorTextBase: '#1F2922', // Very dark slate for text
    colorTextSecondary: '#627164', // Muted slate for secondary text
  };
}

function AdminRoutes() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
      <MainLayout>
        <Routes>
          <Route path="/"           element={<DashboardPage />} />
          <Route path="/books"      element={<BooksPage />} />
          <Route path="/authors"    element={<AuthorsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
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
            siderBg: isDark ? '#141414' : '#FFFFFF',
            headerBg: isDark ? '#141414' : '#FFFFFF',
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
        <ThemedApp />
      </AuthProvider>
    </BrowserRouter>
  )
}
