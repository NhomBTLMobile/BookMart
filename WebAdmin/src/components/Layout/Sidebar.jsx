import { useNavigate, useLocation, NavLink } from 'react-router-dom'
import { Layout, Menu, Avatar, Typography, Tooltip, Tag, Divider } from 'antd'
import {
  DashboardOutlined, BookOutlined, UserOutlined, TagOutlined,
  ShoppingCartOutlined, GiftOutlined, StarOutlined, TeamOutlined,
  LogoutOutlined, ReadOutlined, BulbOutlined, BulbFilled,
} from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'

const { Sider } = Layout
const { Text } = Typography

const ALL_ITEMS = [
  {
    key: '/',
    label: 'Dashboard',
    icon: <DashboardOutlined />,
    roles: ['ADMIN', 'STAFF'],
  },
  { type: 'divider', roles: ['ADMIN', 'STAFF'], key: 'd1' },
  {
    key: 'catalog',
    label: 'Kho sách',
    type: 'group',
    roles: ['ADMIN', 'STAFF'],
    children: [
      { key: '/books',      label: 'Sách',      icon: <BookOutlined />,    roles: ['ADMIN','STAFF'] },
      { key: '/authors',    label: 'Tác giả',   icon: <ReadOutlined />,    roles: ['ADMIN','STAFF'] },
      { key: '/categories', label: 'Thể loại',  icon: <TagOutlined />,     roles: ['ADMIN','STAFF'] },
    ],
  },
  {
    key: 'sales',
    label: 'Bán hàng',
    type: 'group',
    roles: ['ADMIN', 'STAFF'],
    children: [
      { key: '/orders',  label: 'Đơn hàng', icon: <ShoppingCartOutlined />, roles: ['ADMIN','STAFF'] },
      { key: '/reviews', label: 'Đánh giá', icon: <StarOutlined />,         roles: ['ADMIN','STAFF'] },
    ],
  },
  {
    key: 'admin',
    label: 'Quản trị',
    type: 'group',
    roles: ['ADMIN'],
    children: [
      { key: '/users',    label: 'Người dùng', icon: <TeamOutlined />,  roles: ['ADMIN'] },
      { key: '/vouchers', label: 'Vouchers',   icon: <GiftOutlined />,  roles: ['ADMIN'] },
    ],
  },
]

function filterItems(items, role) {
  return items
    .filter(item => item.roles?.includes(role))
    .map(item => {
      if (item.children) {
        const children = item.children.filter(c => c.roles?.includes(role))
        return children.length ? { ...item, children } : null
      }
      return item
    })
    .filter(Boolean)
}

export default function Sidebar() {
  const { user, logout, isDark, toggleTheme } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const initials = user?.full_name
    ? user.full_name.trim().split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
    : 'U'

  const menuItems = filterItems(ALL_ITEMS, user?.role || '')

  const roleTag = {
    ADMIN: { color: 'green',  text: 'Admin' },
    STAFF: { color: 'blue',   text: 'Staff' },
  }[user?.role] || { color: 'default', text: user?.role }

  return (
    <Sider
      width={240}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
      }}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <BookOutlined style={{ color: 'white', fontSize: 18 }} />
        </div>
        <div className="sidebar-logo-text">
          <h3 style={{ color: isDark ? '#fff' : '#1a1a1a' }}>BookMart</h3>
          <span>Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ border: 'none', background: 'transparent' }}
          onClick={({ key }) => navigate(key)}
        />
      </div>

      {/* User footer */}
      <div className="sidebar-user-footer">
        <Avatar
          size={36}
          style={{ background: 'linear-gradient(135deg, #52c41a, #237804)', flexShrink: 0, fontSize: 13, fontWeight: 700 }}
        >
          {initials}
        </Avatar>
        <div className="user-info">
          <div className="user-name" style={{ color: isDark ? '#fff' : '#1a1a1a' }}>
            {user?.full_name || 'Admin'}
          </div>
          <Tag color={roleTag.color} style={{ fontSize: 10, padding: '0 5px', lineHeight: '16px' }}>
            {roleTag.text}
          </Tag>
        </div>
        <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'} placement="right">
          <span
            onClick={toggleTheme}
            style={{ cursor: 'pointer', fontSize: 16, opacity: 0.6, marginRight: 4 }}
          >
            {isDark ? <BulbOutlined /> : <BulbFilled style={{ color: '#faad14' }} />}
          </span>
        </Tooltip>
        <Tooltip title="Đăng xuất" placement="right">
          <span
            onClick={() => { logout(); navigate('/login') }}
            style={{ cursor: 'pointer', fontSize: 16, opacity: 0.6, color: '#ff4d4f' }}
          >
            <LogoutOutlined />
          </span>
        </Tooltip>
      </div>
    </Sider>
  )
}
