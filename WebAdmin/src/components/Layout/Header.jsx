import { useLocation } from 'react-router-dom'
import { Layout, Breadcrumb, Switch, Tooltip, Space, Button } from 'antd'
import { HomeOutlined, SunOutlined, MoonOutlined, MenuOutlined } from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'

const { Header } = Layout

const PAGE_MAP = {
  '/':           { crumb: ['Dashboard'] },
  '/books':      { crumb: ['Kho sách', 'Sách'] },
  '/authors':    { crumb: ['Kho sách', 'Tác giả'] },
  '/categories': { crumb: ['Kho sách', 'Thể loại'] },
  '/orders':     { crumb: ['Bán hàng', 'Đơn hàng'] },
  '/reviews':    { crumb: ['Bán hàng', 'Đánh giá'] },
  '/users':      { crumb: ['Quản trị', 'Người dùng'] },
  '/vouchers':   { crumb: ['Quản trị', 'Vouchers'] },
}

export default function AppHeader({ isMobile, mobileMenuOpen, setMobileMenuOpen }) {
  const { isDark, toggleTheme } = useAuth()
  const location = useLocation()
  const page = PAGE_MAP[location.pathname] || { crumb: ['Admin'] }

  const breadcrumbItems = [
    { title: <HomeOutlined />, href: '/' },
    ...page.crumb.map(c => ({ title: c })),
  ]

  return (
    <Header
      style={{
        padding: isMobile ? '0 16px' : '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(128,128,128,0.1)',
        background: isDark ? '#141414' : '#fff',
      }}
    >
      {isMobile && (
        <Button 
          type="text" 
          icon={<MenuOutlined />} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          style={{ fontSize: 18, padding: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      )}
      <Breadcrumb items={breadcrumbItems} style={{ flex: 1, display: isMobile ? 'none' : 'block' }} />
      {isMobile && <div style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{page.crumb[page.crumb.length - 1]}</div>}

      {/* Theme Toggle — rõ ràng, luôn hiển thị */}
      <Tooltip title={isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'} placement="bottom">
        <Space size={8} align="center" style={{ cursor: 'pointer' }} onClick={toggleTheme}>
          <SunOutlined style={{ fontSize: 15, color: !isDark ? '#faad14' : undefined }} />
          <Switch
            checked={isDark}
            size="small"
            style={{ background: isDark ? '#689f38' : undefined }}
          />
          <MoonOutlined style={{ fontSize: 15, color: isDark ? '#c084fc' : undefined }} />
        </Space>
      </Tooltip>
    </Header>
  )
}
