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

// Green brand token
const GREEN_TOKEN = {
  colorPrimary:       '#52c41a',
  colorLink:          '#52c41a',
  colorSuccess:       '#52c41a',
  borderRadius:       8,
  borderRadiusLG:     12,
  fontFamily:         `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
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
        token: GREEN_TOKEN,
        components: {
          Menu: {
            itemBorderRadius: 8,
            subMenuItemBorderRadius: 8,
          },
          Layout: {
            siderBg: isDark ? '#141414' : '#ffffff',
            headerBg: isDark ? '#141414' : '#ffffff',
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
