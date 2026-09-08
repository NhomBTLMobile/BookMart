import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Typography, Skeleton } from 'antd'
import {
  DollarOutlined, ShoppingCartOutlined, BookOutlined, TeamOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { ordersApi, booksApi, usersApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'

const { Title, Text } = Typography

const REVENUE_DATA = [
  { month: 'T1', revenue: 42, orders: 128 },
  { month: 'T2', revenue: 38, orders: 112 },
  { month: 'T3', revenue: 56, orders: 167 },
  { month: 'T4', revenue: 51, orders: 145 },
  { month: 'T5', revenue: 69, orders: 198 },
  { month: 'T6', revenue: 74, orders: 215 },
  { month: 'T7', revenue: 62, orders: 180 },
  { month: 'T8', revenue: 81, orders: 234 },
]

const PIE_DATA = [
  { name: 'Hoàn thành', value: 58, color: '#689f38' },
  { name: 'Đang xử lý', value: 22, color: '#1677ff' },
  { name: 'Đang giao',  value: 13, color: '#faad14' },
  { name: 'Đã hủy',    value:  7, color: '#ff4d4f' },
]

const ORDER_STATUS = {
  PENDING:   { color: 'gold',    text: 'Chờ xử lý' },
  PREPARING: { color: 'blue',    text: 'Đang chuẩn bị' },
  SHIPPING:  { color: 'cyan',    text: 'Đang giao' },
  COMPLETED: { color: 'green',   text: 'Hoàn thành' },
  CANCELLED: { color: 'red',     text: 'Đã hủy' },
}

const fmt = n => new Intl.NumberFormat('vi-VN').format(n)

const ORDER_COLS = [
  {
    title: 'Mã đơn',
    dataIndex: 'id',
    width: 110,
    render: v => <Text code style={{ fontSize: 12 }}>#{v?.slice(-8).toUpperCase()}</Text>,
  },
  {
    title: 'Thanh toán',
    dataIndex: 'final_price',
    render: v => <Text strong style={{ color: '#689f38' }}>₫ {fmt(v || 0)}</Text>,
  },
  {
    title: 'PT Thanh toán',
    dataIndex: 'payment_method',
    render: v => <Tag color={v === 'VNPAY' ? 'purple' : 'default'}>{v}</Tag>,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'order_status',
    render: v => {
      const s = ORDER_STATUS[v] || { color: 'default', text: v }
      return <Tag color={s.color}>{s.text}</Tag>
    },
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'created_at',
    render: v => <Text type="secondary" style={{ fontSize: 13 }}>{new Date(v).toLocaleDateString('vi-VN')}</Text>,
  },
]

export default function DashboardPage() {
  const { user, isDark } = useAuth()
  const [orders, setOrders]       = useState([])
  const [bookCount, setBookCount] = useState(null)
  const [userCount, setUserCount] = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      ordersApi.getAll({ page: 1, limit: 6, sort: 'created_at', order: 'DESC' }),
      booksApi.getAll({ page: 1, limit: 1 }),
      user?.role === 'ADMIN' ? usersApi.getAll({ page: 1, limit: 1 }) : Promise.resolve(null),
    ]).then(([o, b, u]) => {
      setOrders(o.data.data || [])
      setBookCount(b.data.meta?.total ?? b.data.data?.length ?? 0)
      if (u) setUserCount(u.data.meta?.total ?? u.data.data?.length ?? 0)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const tooltipStyle = {
    background: isDark ? '#1f1f1f' : '#fff',
    border: `1px solid ${isDark ? '#303030' : '#e8e8e8'}`,
    borderRadius: 8,
    fontSize: 13,
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Tổng quan hệ thống</Title>
        <Text type="secondary">Thống kê và báo cáo hoạt động</Text>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: 'Doanh thu tháng này',
            value: '81.0M',
            prefix: '₫',
            icon: <DollarOutlined />,
            iconBg: 'rgba(82,196,26,0.12)',
            iconColor: '#689f38',
            change: '+12.5%',
            up: true,
            demo: true,
          },
          {
            title: 'Đơn hàng tháng này',
            value: 234,
            icon: <ShoppingCartOutlined />,
            iconBg: 'rgba(22,119,255,0.12)',
            iconColor: '#1677ff',
            change: '+8.1%',
            up: true,
            demo: true,
          },
          {
            title: 'Tổng sách',
            value: bookCount,
            icon: <BookOutlined />,
            iconBg: 'rgba(250,173,20,0.12)',
            iconColor: '#faad14',
            change: '+3 tháng này',
            up: true,
          },
          ...(user?.role === 'ADMIN' ? [{
            title: 'Người dùng',
            value: userCount,
            icon: <TeamOutlined />,
            iconBg: 'rgba(114,46,209,0.12)',
            iconColor: '#722ed1',
            change: '+18 tháng này',
            up: true,
          }] : []),
        ].map((card, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card size="small" variant="outlined" style={{ borderRadius: 12 }}>
              <div className="stat-card-inner">
                <div className="stat-card-icon-wrap" style={{ background: card.iconBg, color: card.iconColor }}>
                  {card.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{card.title}</Text>
                  {card.demo && <Tag color="default" style={{ fontSize: 10, marginLeft: 6, padding: '0 4px' }}>Demo</Tag>}
                  {loading && !card.value && card.value !== 0 ? (
                    <Skeleton.Input active size="small" style={{ marginTop: 4, width: 80 }} />
                  ) : (
                    <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, marginTop: 2 }}>
                      {card.prefix && <span style={{ fontSize: 14, marginRight: 2 }}>{card.prefix}</span>}
                      {card.value ?? '–'}
                    </div>
                  )}
                  <Text style={{ fontSize: 12, color: card.up ? '#689f38' : '#ff4d4f' }}>
                    {card.up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {card.change}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title="Doanh thu theo tháng"
            extra={<Tag color="default">Demo</Tag>}
            variant="outlined"
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#689f38" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#689f38" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#303030' : '#f0f0f0'} />
                <XAxis dataKey="month" tick={{ fill: isDark ? '#8c8c8c' : '#595959', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? '#8c8c8c' : '#595959', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}M`} />
                <ReTooltip contentStyle={tooltipStyle} formatter={(v, n) => [n === 'revenue' ? `₫ ${v}M` : `${v} đơn`, n === 'revenue' ? 'Doanh thu' : 'Đơn hàng']} />
                <Area type="monotone" dataKey="revenue" stroke="#689f38" strokeWidth={2.5} fill="url(#gRev)" dot={false} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="orders" stroke="#1677ff" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Trạng thái đơn hàng"
            extra={<Tag color="default">Demo</Tag>}
            variant="outlined"
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="45%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                  {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <ReTooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v}%`, n]} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card
        title="Đơn hàng gần đây"
        extra={<a href="/orders">Xem tất cả</a>}
        variant="outlined"
        style={{ borderRadius: 12 }}
      >
        <Table
          dataSource={orders}
          columns={ORDER_COLS}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}
