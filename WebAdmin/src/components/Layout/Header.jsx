import { useLocation } from 'react-router-dom'
import { Layout, Breadcrumb, Switch, Tooltip, Space } from 'antd'
import { HomeOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons'
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

export default function AppHeader() {
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
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(128,128,128,0.1)',
      }}
    >
      <Breadcrumb items={breadcrumbItems} style={{ flex: 1 }} />

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
