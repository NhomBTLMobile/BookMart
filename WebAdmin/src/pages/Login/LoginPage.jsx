import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  Form, Input, Button, Alert, Typography, Space, theme as antTheme,
} from 'antd'
import {
  BookOutlined, MailOutlined, LockOutlined, ArrowRightOutlined,
  SunOutlined, MoonOutlined,
} from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'

const { Title, Text } = Typography

export default function LoginPage() {
  const { login, user, isDark, toggleTheme } = useAuth()
  const navigate = useNavigate()
  const { token } = antTheme.useToken()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  if (user) return <Navigate to="/" replace />

  const onFinish = async ({ email, password }) => {
    setError('')
    setLoading(true)
    try {
      const u = await login(email, password)
      if (!['ADMIN', 'STAFF'].includes(u.role)) {
        setError('Tài khoản này không có quyền truy cập trang quản trị.')
        return
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: token.colorBgLayout,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Left decorative panel ───────────────────────── */}
      <div
        style={{
          flex: 1,
          background: `linear-gradient(145deg, #237804 0%, #52c41a 50%, #95de64 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          border: '60px solid rgba(255,255,255,0.07)',
          top: -80, left: -80,
        }} />
        <div style={{
          position: 'absolute', width: 220, height: 220, borderRadius: '50%',
          border: '40px solid rgba(255,255,255,0.07)',
          bottom: -60, right: -60,
        }} />
        <div style={{
          position: 'absolute', width: 150, height: 150, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          bottom: 100, left: '30%',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 380, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}>
            <BookOutlined style={{ fontSize: 34, color: 'white' }} />
          </div>
          <Title level={2} style={{ color: 'white', margin: '0 0 12px', textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            BookMart
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 1.7 }}>
            Hệ thống quản lý nhà sách trực tuyến. Quản lý sách, đơn hàng và khách hàng một cách dễ dàng.
          </Text>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Quản lý kho sách & tác giả', 'Theo dõi đơn hàng real-time', 'Phân quyền ADMIN & STAFF'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: 'white', fontWeight: 700, flexShrink: 0,
                }}>✓</div>
                <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14 }}>{f}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right login form ─────────────────────────────── */}
      <div
        style={{
          width: 480,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 56px',
          background: token.colorBgContainer,
          position: 'relative',
        }}
      >
        {/* Theme toggle top-right */}
        <div style={{ position: 'absolute', top: 24, right: 24 }}>
          <Button
            type="text"
            icon={isDark ? <SunOutlined style={{ color: '#faad14' }} /> : <MoonOutlined style={{ color: '#722ed1' }} />}
            onClick={toggleTheme}
            title={isDark ? 'Chuyển Light Mode' : 'Chuyển Dark Mode'}
          />
        </div>

        <div style={{ marginBottom: 36 }}>
          <Title level={3} style={{ margin: '0 0 6px' }}>Đăng nhập</Title>
          <Text type="secondary">Nhập thông tin tài khoản để tiếp tục</Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item
            label="Địa chỉ Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input
              id="login-email"
              prefix={<MailOutlined style={{ opacity: 0.35 }} />}
              placeholder="admin@bookmart.vn"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              id="login-password"
              prefix={<LockOutlined style={{ opacity: 0.35 }} />}
              placeholder="Nhập mật khẩu của bạn"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button
              id="login-submit"
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              size="large"
              style={{ height: 44 }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Text
          type="secondary"
          style={{ textAlign: 'center', marginTop: 32, fontSize: 12, display: 'block' }}
        >
          BookMart Admin &copy; {new Date().getFullYear()}
          <br />Chỉ dành cho tài khoản ADMIN &amp; STAFF
        </Text>
      </div>
    </div>
  )
}
