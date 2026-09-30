import { useEffect, useState, useRef } from 'react'
import {
  Row, Col, Card, Table, Tag, Typography, Skeleton, Button, Modal, Space, Divider, Tooltip, Badge
} from 'antd'
import {
  DollarOutlined, ShoppingCartOutlined, BookOutlined, TeamOutlined,
  PrinterOutlined, EyeOutlined, FileTextOutlined,
  CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, CloseCircleOutlined,
  GlobalOutlined, PhoneOutlined, MailOutlined, HomeOutlined
} from '@ant-design/icons'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { dashboardApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'

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
  const { user, isDark } = useAuth()

  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalBooksSold: 0, newUsers: 0 })
  const [revenueChart, setRevenueChart] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [topBooks, setTopBooks] = useState([])
  const [statusPieData, setStatusPieData] = useState([])
  const [loading, setLoading] = useState(true)

  // Invoice Modal State
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)

  const printRef = useRef(null)

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

  const handlePrint = () => {
    window.print()
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
      render: v => {
        const s = ORDER_STATUS[String(v || '').toLowerCase()] || { color: 'default', text: v, icon: null }
        return <Tag icon={s.icon} color={s.color} style={{ borderRadius: 12 }}>{s.text}</Tag>
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
            >
              Hóa đơn
            </Button>
          </Tooltip>
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
          <Title level={3} style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>Tổng Quan Hệ Thống Quản Trị</Title>
          <Text type="secondary">Báo cáo doanh thu & chỉ số hoạt động kinh doanh trực tuyến BookMart</Text>
        </div>
        <div style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: 'rgba(132, 177, 121, 0.15)', color: '#059669', border: '1px solid #059669' }}>
          ● Hệ thống hoạt động bình thường
        </div>
      </div>

      {/* ── STAT CARDS (Chữ bên trái, số hiển thị động bên phải) ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            label: 'Tổng doanh thu',
            value: stats.totalRevenue,
            prefix: '₫',
            icon: <DollarOutlined />,
            iconBg: 'rgba(104,159,56,0.14)',
            iconColor: '#059669',
            sub: 'Cập nhật thời gian thực'
          },
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
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card
              size="small"
              variant="outlined"
              style={{
                borderRadius: 14,
                background: isDark ? '#18181B' : '#ffffff',
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              bodyStyle={{ padding: 18 }}
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

      {/* ── MODAL IN HÓA ĐƠN (PRINTABLE INVOICE MODAL) ── */}
      <Modal
        open={invoiceModalOpen}
        onCancel={() => setInvoiceModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setInvoiceModalOpen(false)}>
            Đóng
          </Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint} style={{ backgroundColor: '#059669' }}>
            In Hóa Đơn
          </Button>,
        ]}
        width={720}
        destroyOnClose
        style={{ top: 20 }}
      >
        {selectedOrder && (
          <div ref={printRef} className="printable-invoice" style={{ padding: '10px 10px' }}>
            {/* Header Website */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src="/bookmart_logo.png" alt="BookMart" style={{ height: 40 }} />
                  <Title level={3} style={{ margin: 0, color: '#059669', fontFamily: "'Inter', sans-serif" }}>BookMart</Title>
                </div>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
                  <GlobalOutlined /> Website: <strong>bookmart.vn</strong> | <PhoneOutlined /> Hotline: 1900 8888
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <MailOutlined /> Email: cskh@bookmart.vn | Hóa Đơn Bán Hàng Trực Tuyến
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Title level={4} style={{ margin: 0, color: isDark ? '#e5e7eb' : '#333' }}>HÓA ĐƠN BÁN HÀNG</Title>
                <Text code style={{ fontSize: 14, color: '#059669', fontWeight: 700 }}>#{selectedOrder.order_code}</Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Ngày lập: {new Date(selectedOrder.created_at).toLocaleDateString('vi-VN')} {new Date(selectedOrder.created_at).toLocaleTimeString('vi-VN')}
                  </Text>
                </div>
              </div>
            </div>

            {/* Thông tin khách hàng & Giao hàng */}
            <Card size="small" style={{ borderRadius: 8, marginBottom: 20, background: isDark ? '#27272A' : '#f8fafc', borderColor: isDark ? '#3F3F46' : '#e2e8f0' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>KHÁCH HÀNG:</Text>
                  <Text strong style={{ fontSize: 15, color: isDark ? '#e5e7eb' : '#0f172a' }}>{selectedOrder.customer_name || 'Khách vãng lai'}</Text>
                  {selectedOrder.customer_email && <div style={{ fontSize: 13 }}>Email: {selectedOrder.customer_email}</div>}
                  {selectedOrder.customer_phone && <div style={{ fontSize: 13 }}>SĐT: <strong>{selectedOrder.customer_phone}</strong></div>}
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>ĐỊA CHỈ GIAO HÀNG:</Text>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    <HomeOutlined style={{ marginRight: 4, color: '#059669' }} />
                    {addressInfo?.full_address || addressInfo?.street_address || 'Địa chỉ đăng ký trên hệ thống'}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Hình thức thanh toán: </Text>
                    <Tag color={selectedOrder.payment_method === 'vnpay' ? 'purple' : 'blue'} style={{ fontWeight: 600 }}>
                      {selectedOrder.payment_method === 'vnpay' ? 'Thanh toán VNPAY' : 'Thanh toán COD'}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Bảng danh sách sản phẩm (STT, Tên sách, Đơn giá, Số lượng, Thành tiền - KHÔNG mã SP) */}
            <Title level={5} style={{ marginBottom: 10, color: isDark ? '#e5e7eb' : '#0f172a' }}>Chi tiết danh sách sách đặt mua</Title>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, color: isDark ? '#e5e7eb' : '#0f172a' }}>
              <thead>
                <tr style={{ background: isDark ? '#262626' : '#f1f5f9', borderBottom: `2px solid ${isDark ? '#434343' : '#e2e8f0'}`, textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', width: 50, textAlign: 'center' }}>STT</th>
                  <th style={{ padding: '8px 12px' }}>Tên sách</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', width: 120 }}>Đơn giá</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', width: 80 }}>Số lượng</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', width: 130 }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${isDark ? '#3F3F46' : '#e2e8f0'}` }}>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: isDark ? '#a6a6a6' : '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.item_name}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>₫ {fmt(item.unit_price)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>₫ {fmt(item.total_price)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#8c8c8c' }}>
                      Sản phẩm trong đơn hàng #{selectedOrder.order_code}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Bảng tổng tiền & thanh toán */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <div style={{ width: 280 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                  <Text type="secondary">Tạm tính tiền hàng:</Text>
                  <Text strong>₫ {fmt(selectedOrder.subtotal || selectedOrder.total_amount)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                  <Text type="secondary">Phí vận chuyển:</Text>
                  <Text>₫ {fmt(selectedOrder.shipping_fee || 30000)}</Text>
                </div>
                {Number(selectedOrder.discount_amount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, color: '#ff4d4f' }}>
                    <Text type="secondary" style={{ color: '#ff4d4f' }}>Giảm giá (Voucher):</Text>
                    <Text strong style={{ color: '#ff4d4f' }}>- ₫ {fmt(selectedOrder.discount_amount)}</Text>
                  </div>
                )}
                <Divider style={{ margin: '8px 0', borderColor: isDark ? '#434343' : 'rgba(0,0,0,0.06)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 16 }}>
                  <Text strong style={{ color: isDark ? '#e5e7eb' : '#0f172a' }}>TỔNG THANH TOÁN:</Text>
                  <Text strong style={{ color: '#059669', fontSize: 18 }}>₫ {fmt(selectedOrder.total_amount)}</Text>
                </div>
              </div>
            </div>

            {/* Chân trang hóa đơn */}
            <div style={{ marginTop: 30, paddingTop: 16, borderTop: `1px dashed ${isDark ? '#434343' : '#d9d9d9'}`, textTransform: 'center', textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic', display: 'block' }}>
                Cảm ơn Quý khách đã mua sắm tại BookMart.vn!
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Mọi thắc mắc vui lòng liên hệ Hotline 1900 8888 để được hỗ trợ giải đáp.
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* CSS @media print chuyên dụng cho việc in ấn Hóa Đơn */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-invoice, .printable-invoice * {
            visibility: visible;
          }
          .printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px !important;
            background: #fff !important;
            color: #000 !important;
          }
          .ant-modal-footer, .ant-modal-close {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
