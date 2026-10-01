import { useEffect, useState, useRef } from 'react'
import {
  Row, Col, Card, Table, Tag, Typography, Skeleton, Button, Modal, Space, Divider, Tooltip, Badge, Dropdown, App
} from 'antd'
import {
  DollarOutlined, ShoppingCartOutlined, BookOutlined, TeamOutlined,
  PrinterOutlined, EyeOutlined, FileTextOutlined,
  CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, CloseCircleOutlined, DownOutlined, SendOutlined,
  GlobalOutlined, PhoneOutlined, MailOutlined, HomeOutlined
} from '@ant-design/icons'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { dashboardApi, ordersApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import InvoiceModal from '../../components/Invoice/InvoiceModal'
import GhnModal from '../../components/Invoice/GhnModal'

const { Title, Text } = Typography

const ORDER_STATUS = {
  pending:   { color: '#F59E0B', text: 'Chờ xử lý',  icon: <ClockCircleOutlined /> },
  confirmed: { color: '#3B82F6', text: 'Đã xác nhận', icon: <SyncOutlined spin /> },
  packing:   { color: '#8B5CF6', text: 'Đang đóng gói', icon: <SyncOutlined spin /> },
  shipping:  { color: '#06B6D4', text: 'Đang giao',  icon: <SyncOutlined spin /> },
  delivered: { color: '#059669', text: 'Hoàn thành', icon: <CheckCircleOutlined /> },
  cancelled: { color: '#EF4444', text: 'Đã hủy',     icon: <CloseCircleOutlined /> },
}

const PIE_COLORS = ['#059669', '#34D399', '#C7EABB', '#E8F5BD', '#faad14', '#ff4d4f']

const fmt = n => new Intl.NumberFormat('vi-VN').format(Number(n) || 0)

export default function DashboardPage() {
  const { message } = App.useApp()
  const { user, isDark } = useAuth()
  const isStaff = user?.role?.toUpperCase() === 'STAFF'

  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalBooksSold: 0, newUsers: 0 })
  const [revenueChart, setRevenueChart] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [topBooks, setTopBooks] = useState([])
  const [statusPieData, setStatusPieData] = useState([])
  const [loading, setLoading] = useState(true)

  // Invoice Modal State
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [ghnModalOpen, setGhnModalOpen] = useState(false)

  const reloadData = () => {
    dashboardApi.getRecentOrders().then(ro => {
      if (ro.data?.success && Array.isArray(ro.data.data)) {
        setRecentOrders(ro.data.data)
      }
    })
  }

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getRevenueChart(),
      dashboardApi.getRecentOrders(),
      dashboardApi.getTopBooks()
    ]).then(([st, ch, ro, tb]) => {
      if (st.data?.success && st.data.data) setStats(st.data.data)
      if (ch.data?.success && Array.isArray(ch.data.data)) setRevenueChart(ch.data.data)
      if (ro.data?.success && Array.isArray(ro.data.data)) {
        const ordersList = ro.data.data
        setRecentOrders(ordersList)

        // Compute pie chart distribution from recent orders
        const counts = {}
        ordersList.forEach(o => {
          const s = (o.order_status || 'pending').toLowerCase()
          counts[s] = (counts[s] || 0) + 1
        })
        const pie = Object.keys(counts).map((key) => {
          const status = ORDER_STATUS[key] || { text: key, color: '#9CA3AF' }
          return {
            name: status.text,
            value: counts[key],
            color: status.color
          }
        })
        setStatusPieData(pie.length ? pie : [{ name: 'Hoàn thành', value: 1, color: '#059669' }])
      }
      if (tb.data?.success && Array.isArray(tb.data.data)) setTopBooks(tb.data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleOpenInvoice = (order) => {
    setSelectedOrder(order)
    setInvoiceModalOpen(true)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersApi.update(orderId, { order_status: newStatus })
      message.success('Cập nhật trạng thái thành công')
      setRecentOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o))
    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái')
    }
  }

  // Column specs: Bố cục "STT số bên trái / bên phải, không hiển thị mã SP"
  const orderColumns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => <Text strong style={{ color: '#8c8c8c' }}>{index + 1}</Text>,
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'order_code',
      width: 140,
      render: v => <Text code style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>#{v || 'BM-ORDER'}</Text>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      render: (v, rec) => (
        <div>
          <Text strong style={{ display: 'block' }}>{v || 'Khách vãng lai'}</Text>
          {rec.customer_phone && <Text type="secondary" style={{ fontSize: 12 }}>{rec.customer_phone}</Text>}
        </div>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'total_amount',
      align: 'right',
      render: v => <Text strong style={{ fontSize: 14 }}>₫ {fmt(v)}</Text>,
    },
    {
      title: 'Phương thức',
      dataIndex: 'payment_method',
      align: 'center',
      render: v => (
        <Tag color={v === 'vnpay' ? 'purple' : 'blue'} style={{ borderRadius: 12, textTransform: 'uppercase', fontWeight: 600 }}>
          {v === 'vnpay' ? 'VNPay' : 'COD'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'order_status',
      align: 'center',
      render: (v, record) => {
        const currentKey = String(v || '').toLowerCase()
        const currentStatus = ORDER_STATUS[currentKey] || { color: 'default', text: currentKey, icon: null }
        return (
          <Dropdown
            menu={{
              items: Object.keys(ORDER_STATUS).map(key => ({
                key,
                label: (
                  <span style={{ color: ORDER_STATUS[key].color, fontWeight: 500 }}>
                    {ORDER_STATUS[key].text}
                  </span>
                )
              })),
              onClick: (e) => handleStatusChange(record.id, e.key)
            }}
            trigger={['click']}
          >
            <div style={{ cursor: 'pointer', display: 'inline-block' }}>
              <Badge color={currentStatus.color} text={<span style={{ fontWeight: 500 }}>{currentStatus.text} <DownOutlined style={{ fontSize: 10, marginLeft: 2 }}/></span>} />
            </div>
          </Dropdown>
        )
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      align: 'center',
      render: v => <Text type="secondary" style={{ fontSize: 12 }}>{v ? new Date(v).toLocaleDateString('vi-VN') : '—'}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Xem & In Hóa đơn">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => handleOpenInvoice(record)}
              style={{ borderRadius: 6 }}
            />
          </Tooltip>
          {String(record.order_status).toLowerCase() === 'confirmed' && (
            <Tooltip title="Tạo đơn GHN">
              <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                onClick={() => {
                  setSelectedOrder(record)
                  setGhnModalOpen(true)
                }}
                style={{ background: '#f59e0b', borderRadius: 6 }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  const topBookColumns = [
    {
      title: 'STT',
      key: 'stt',
      width: 55,
      align: 'center',
      render: (_, __, index) => (
        <Badge
          count={index + 1}
          style={{
            backgroundColor: index === 0 ? '#faad14' : index === 1 ? '#d9d9d9' : index === 2 ? '#d48806' : '#f0f0f0',
            color: index < 3 ? '#fff' : '#595959',
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      title: 'Tên sách',
      dataIndex: 'title',
      render: (v, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {record.image_url ? (
            <img src={record.image_url} alt={v} style={{ width: 36, height: 46, objectFit: 'cover', borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
          ) : (
            <div style={{ width: 36, height: 46, background: '#e6f7ff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOutlined style={{ color: '#1890ff' }} />
            </div>
          )}
          <Text strong ellipsis style={{ maxWidth: 220 }}>{v}</Text>
        </div>
      ),
    },
    {
      title: 'Giá bán',
      dataIndex: 'sale_price',
      align: 'right',
      render: v => <Text strong>₫ {fmt(v)}</Text>,
    },
    {
      title: 'Đã bán',
      dataIndex: 'total_quantity',
      align: 'right',
      render: v => <Tag color="#059669" style={{ borderRadius: 10, fontWeight: 700 }}>{fmt(v)} cuốn</Tag>,
    },
  ]

  const tooltipStyle = {
    background: isDark ? '#27272A' : '#ffffff',
    border: `1px solid ${isDark ? '#3F3F46' : '#e2e8f0'}`,
    borderRadius: 8,
    fontSize: 13,
  }

  // Format parsed snapshot address
  let addressInfo = null
  if (selectedOrder?.shipping_snapshot) {
    try {
      addressInfo = typeof selectedOrder.shipping_snapshot === 'string'
        ? JSON.parse(selectedOrder.shipping_snapshot)
        : selectedOrder.shipping_snapshot
    } catch {
      addressInfo = null
    }
  }

  return (
    <div className="dashboard-container">
      {/* Header section */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>
            {isStaff ? 'Khu Vực Quản Lý & Xử Lý Đơn Hàng' : 'Tổng Quan Hệ Thống Quản Trị'}
          </Title>
          <Text type="secondary">
            {isStaff ? 'Trung tâm điều phối và kiểm soát trạng thái kinh doanh' : 'Báo cáo doanh thu & chỉ số hoạt động kinh doanh trực tuyến BookMart'}
          </Text>
        </div>
        <div style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: 'rgba(132, 177, 121, 0.15)', color: '#059669', border: '1px solid #059669' }}>
          ● Hệ thống hoạt động bình thường
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          ...(isStaff ? [] : [{
            label: 'Tổng doanh thu',
            value: stats.totalRevenue,
            prefix: '₫',
            icon: <DollarOutlined />,
            iconBg: 'rgba(104,159,56,0.14)',
            iconColor: '#059669',
            sub: 'Cập nhật thời gian thực'
          }]),
          {
            label: 'Tổng đơn hàng',
            value: stats.totalOrders,
            suffix: 'đơn',
            icon: <ShoppingCartOutlined />,
            iconBg: 'rgba(22,119,255,0.14)',
            iconColor: '#1677ff',
            sub: 'Đơn đã xác nhận & thành công'
          },
          {
            label: 'Sách đã bán',
            value: stats.totalBooksSold,
            suffix: 'cuốn',
            icon: <BookOutlined />,
            iconBg: 'rgba(250,173,20,0.14)',
            iconColor: '#faad14',
            sub: 'Tổng số lượng ấn phẩm'
          },
          {
            label: 'Người dùng mới',
            value: stats.newUsers,
            suffix: 'thành viên',
            icon: <TeamOutlined />,
            iconBg: 'rgba(114,46,209,0.14)',
            iconColor: '#722ed1',
            sub: 'Đăng ký trong tháng này'
          }
        ].map((card, i) => (
          <Col key={i} xs={24} sm={12} lg={isStaff ? 8 : 6}>
            <Card
              size="small"
              variant="outlined"
              style={{
                borderRadius: 14,
                background: isDark ? '#18181B' : '#ffffff',
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              styles={{ body: { padding: 18 } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* CHỮ BÊN TRÁI */}
                <div style={{ flex: 1, paddingRight: 8 }}>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    {card.label}
                  </Text>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 12, background: card.iconBg, color: card.iconColor, fontSize: 12, fontWeight: 600 }}>
                    {card.icon} {card.sub}
                  </div>
                </div>

                {/* SỐ ĐỘNG BÊN PHẢI */}
                <div style={{ textAlign: 'right' }}>
                  {loading ? (
                    <Skeleton.Input active size="small" style={{ width: 90 }} />
                  ) : (
                    <div style={{ fontSize: 22, fontWeight: 800, color: isDark ? '#fff' : '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                      {card.prefix && <span style={{ fontSize: 14, marginRight: 2, color: card.iconColor }}>{card.prefix} </span>}
                      {fmt(card.value)}
                      {card.suffix && <span style={{ fontSize: 12, marginLeft: 4, fontWeight: 500, color: '#8c8c8c' }}>{card.suffix}</span>}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── CHARTS SECTION ── */}
      {!isStaff && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={15}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarOutlined style={{ color: '#059669' }} />
                <span>Biểu đồ tăng trưởng Doanh thu (30 ngày gần nhất)</span>
              </div>
            }
            variant="outlined"
            style={{ borderRadius: 14, height: '100%' }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3F3F46' : '#f1f5f9'} />
                <XAxis dataKey="date" tick={{ fill: isDark ? '#8c8c8c' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? '#8c8c8c' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <ReTooltip contentStyle={tooltipStyle} formatter={(v) => [`₫ ${fmt(v)}`, 'Doanh thu']} />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} fill="url(#gRev)" dot={{ r: 3, fill: '#059669' }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCartOutlined style={{ color: '#059669' }} />
                <span>Cơ cấu Trạng thái Đơn hàng</span>
              </div>
            }
            variant="outlined"
            style={{ borderRadius: 14, height: '100%' }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ReTooltip formatter={(val, name) => [`${val} đơn hàng`, name]} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        </Row>
      )}

      {/* ── TOP BOOKS & RECENT ORDERS SECTION ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileTextOutlined style={{ color: '#059669' }} />
                  <span>Đơn hàng mới nhất cần xử lý</span>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>Hiển thị 10 đơn gần đây</Text>
              </div>
            }
            variant="outlined"
            style={{ borderRadius: 14 }}
          >
            <Table
              dataSource={recentOrders}
              columns={orderColumns}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="middle"
              scroll={{ x: 750 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOutlined style={{ color: '#faad14' }} />
                <span>Top 5 Sách Bán Chạy Nhất</span>
              </div>
            }
            variant="outlined"
            style={{ borderRadius: 14, height: '100%' }}
          >
            <Table
              dataSource={topBooks}
              columns={topBookColumns}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* ── MODAL IN HÓA ĐƠN ── */}
      <InvoiceModal 
        open={invoiceModalOpen} 
        onClose={() => setInvoiceModalOpen(false)} 
        order={selectedOrder} 
      />

      {/* ── MODAL GHN ── */}
      <GhnModal
        open={ghnModalOpen}
        onClose={() => setGhnModalOpen(false)}
        orderId={selectedOrder?.id}
        onSuccess={reloadData}
      />
    </div>
  )
}
