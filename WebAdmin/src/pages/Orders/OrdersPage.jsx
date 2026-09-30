import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Drawer,
  Form,
  Select,
  Tag,
  Tooltip,
  Popconfirm,
  Typography,
  Divider,
  Row,
  Col,
  Badge,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  SaveOutlined
} from "@ant-design/icons";
import { App } from "antd";
import { useCrud } from "../../hooks/useCrud";
import { ordersApi } from "../../api/services";
import { useAuth } from "../../context/AuthContext";

const { Text, Title } = Typography;
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Number(n) || 0);

const ORDER_STATUS_OPTIONS = [
  { label: "Chờ xử lý", value: "pending", color: "#F59E0B" },
  { label: "Đã xác nhận", value: "confirmed", color: "#3B82F6" },
  { label: "Đang đóng gói", value: "packing", color: "#8B5CF6" },
  { label: "Đang giao", value: "shipping", color: "#06B6D4" },
  { label: "Hoàn thành", value: "delivered", color: "#059669" },
  { label: "Đã hủy", value: "cancelled", color: "#EF4444" },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: "Chưa thanh toán", value: "unpaid", color: "warning" },
  { label: "Đã thanh toán", value: "paid", color: "#059669" },
  { label: "Hoàn tiền", value: "refunded", color: "default" },
];

const getStatus = (val, options) => {
  const v = String(val).toLowerCase();
  return options.find(o => o.value === v) || { label: val, color: "default" };
};

export default function OrdersPage() {
  const { user, isDark } = useAuth();
  const { message } = App.useApp();
  const crud = useCrud(ordersApi);
  const [form] = Form.useForm();
  
  const [viewRec, setViewRec] = useState(null);
  const [saving, setSaving] = useState(false);

  const openDetail = async (id) => {
    try {
      const res = await ordersApi.getById(id);
      if (res.data?.success) {
        const order = res.data.data;
        setViewRec(order);
        form.setFieldsValue({
          order_status: order.order_status?.toLowerCase(),
          payment_status: order.payment_status?.toLowerCase(),
        });
      }
    } catch (err) {
      message.error("Lỗi khi tải chi tiết đơn hàng");
    }
  };

  const handleSaveStatus = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await crud.update(viewRec.id, values);
      message.success("Cập nhật trạng thái thành công");
      // Cập nhật lại state viewRec để UI phản hồi ngay
      setViewRec(prev => ({ ...prev, ...values }));
    } catch (err) {
      if (err?.response) message.error(err.response.data?.message || "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "order_code",
      width: 140,
      render: (v) => (
        <Text code style={{ fontSize: 13, fontWeight: 700, color: '#059669', background: 'rgba(5, 150, 105, 0.1)' }}>
          #{v || "BM-ORDER"}
        </Text>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer_name",
      render: (v, rec) => (
        <div>
          <Text strong style={{ display: 'block', color: isDark ? '#f3f4f6' : '#1f2937' }}>{v || "Khách vãng lai"}</Text>
          {rec.customer_phone && <Text type="secondary" style={{ fontSize: 12 }}>{rec.customer_phone}</Text>}
        </div>
      ),
    },
    {
      title: "Tổng thanh toán",
      dataIndex: "total_amount",
      align: 'right',
      render: (v) => (
        <Text strong style={{ fontSize: 14 }}>
          ₫ {fmt(v)}
        </Text>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_method",
      align: 'center',
      render: (v) => (
        <Tag color={String(v).toLowerCase() === "vnpay" ? "purple" : "blue"} style={{ textTransform: 'uppercase', fontWeight: 600, borderRadius: 12 }}>
          {String(v).toLowerCase() === "vnpay" ? "VNPay" : "COD"}
        </Tag>
      ),
    },
    {
      title: "TT Thanh toán",
      dataIndex: "payment_status",
      align: 'center',
      render: (v) => {
        const s = getStatus(v, PAYMENT_STATUS_OPTIONS);
        return <Tag color={s.color} style={{ borderRadius: 12 }}>{s.label}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "order_status",
      align: 'center',
      render: (v) => {
        const s = getStatus(v, ORDER_STATUS_OPTIONS);
        return <Badge color={s.color} text={<span style={{ fontWeight: 500 }}>{s.label}</span>} />;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      align: 'center',
      render: (v) => (
        <Text type="secondary" style={{ fontSize: 12 }}>{v ? new Date(v).toLocaleDateString("vi-VN") : '—'}</Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      align: 'center',
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Chi tiết & Xử lý">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => openDetail(rec.id)}
              style={{ background: '#059669' }}
            />
          </Tooltip>
          {user?.role === "ADMIN" && (
            <Popconfirm
              title="Xóa đơn hàng này?"
              okText="Xóa"
              okButtonProps={{ danger: true }}
              cancelText="Hủy"
              onConfirm={() => crud.remove(rec.id)}
            >
              <Button icon={<DeleteOutlined />} size="small" danger type="text" />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const itemColumns = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên sách',
      dataIndex: 'item_name',
      render: v => <Text strong>{v}</Text>
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      align: 'right',
      render: v => `₫ ${fmt(v)}`
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      align: 'center',
      render: v => <Text strong>{v}</Text>
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total_price',
      align: 'right',
      render: v => <Text strong>₫ {fmt(v)}</Text>
    }
  ];

  let addressInfo = null;
  if (viewRec?.shipping_snapshot) {
    try {
      addressInfo = typeof viewRec.shipping_snapshot === 'string'
        ? JSON.parse(viewRec.shipping_snapshot)
        : viewRec.shipping_snapshot;
    } catch {
      addressInfo = null;
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>
            Quản lý Đơn hàng
          </Title>
          <Text type="secondary">Theo dõi, duyệt đơn và cập nhật trạng thái vận chuyển</Text>
        </div>
      </div>

      <Card variant="outlined" style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} bodyStyle={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm theo mã đơn hàng..."
            value={crud.search}
            onChange={(e) => crud.handleSearch(e.target.value)}
            style={{ width: 320, borderRadius: 8, height: 40 }}
            allowClear
          />
        </div>
        <Table scroll={{ x: 900 }}
          dataSource={crud.data}
          columns={columns}
          rowKey="id"
          loading={crud.loading}
          size="middle"
          pagination={{
            current: crud.page,
            pageSize: 10,
            total: crud.meta?.total,
            onChange: crud.setPage,
            showSizeChanger: false,
            position: ['bottomCenter']
          }}
        />
      </Card>

      <Drawer
        title={<span style={{ fontFamily: "'Inter', sans-serif", fontSize: 20 }}>Chi tiết Đơn hàng {viewRec && <Text code style={{ color: '#059669', background: 'rgba(5, 150, 105, 0.1)', border: 'none' }}>#{viewRec.order_code}</Text>}</span>}
        width={700}
        onClose={() => setViewRec(null)}
        open={!!viewRec}
        bodyStyle={{ paddingBottom: 80, background: isDark ? '#18181B' : '#F9FAFB' }}
      >
        {viewRec && (
          <div>
            {/* Control Panel: Trạng thái */}
            <Card size="small" variant="outlined" style={{ marginBottom: 16, borderRadius: 12, border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}`, background: isDark ? '#27272A' : '#ffffff' }}>
              <Form form={form} layout="vertical">
                <Row gutter={16} align="bottom">
                  <Col span={9}>
                    <Form.Item label="Tiến độ đơn hàng" name="order_status" style={{ margin: 0 }}>
                      <Select
                        options={ORDER_STATUS_OPTIONS.map((o) => ({
                          label: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Badge color={o.color} /> {o.label}</div>,
                          value: o.value,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={9}>
                    <Form.Item label="Thanh toán" name="payment_status" style={{ margin: 0 }}>
                      <Select
                        options={PAYMENT_STATUS_OPTIONS.map((o) => ({
                          label: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Badge color={o.color} /> {o.label}</div>,
                          value: o.value,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveStatus} loading={saving} style={{ background: '#059669', width: '100%' }}>
                      Cập nhật
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>

            {/* Thông tin */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" title={<span style={{ color: '#059669' }}><UserOutlined /> Khách hàng</span>} variant="outlined" style={{ height: '100%', borderRadius: 12, border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}`, background: isDark ? '#27272A' : '#ffffff' }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Tên:</Text>
                      <Text strong>{viewRec.customer_name || 'Khách vãng lai'}</Text>
                    </div>
                    {viewRec.customer_phone && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">SĐT:</Text>
                        <Text>{viewRec.customer_phone}</Text>
                      </div>
                    )}
                    {viewRec.customer_email && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Email:</Text>
                        <Text>{viewRec.customer_email}</Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title={<span style={{ color: '#059669' }}><EnvironmentOutlined /> Giao hàng</span>} variant="outlined" style={{ height: '100%', borderRadius: 12, border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}`, background: isDark ? '#27272A' : '#ffffff' }}>
                  {addressInfo ? (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div><Text strong>{addressInfo.full_name || addressInfo.name || viewRec.customer_name}</Text> - <Text type="secondary">{addressInfo.phone || viewRec.customer_phone}</Text></div>
                      <div><Text type="secondary">{addressInfo.full_address || addressInfo.address || addressInfo.street_address}</Text></div>
                    </Space>
                  ) : (
                    <Text type="secondary">Sử dụng địa chỉ đăng ký</Text>
                  )}
                </Card>
              </Col>
            </Row>

            {/* Chi tiết đơn */}
            <Card size="small" variant="outlined" style={{ marginTop: 16, borderRadius: 12, border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}`, background: isDark ? '#27272A' : '#ffffff' }}>
              <Title level={5} style={{ margin: '0 0 12px 0' }}><DollarOutlined style={{ color: '#059669' }} /> Chi tiết sản phẩm</Title>
              <Table
                dataSource={viewRec.items || []}
                columns={itemColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />

              <Row justify="end" style={{ marginTop: 24, paddingRight: 12 }}>
                <Col xs={24} sm={16} md={12}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Tạm tính:</Text>
                    <Text>₫ {fmt(viewRec.subtotal)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Phí vận chuyển:</Text>
                    <Text>₫ {fmt(viewRec.shipping_fee)}</Text>
                  </div>
                  
                  {Number(viewRec.discount_amount) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text type="secondary">Mã giảm giá:</Text>
                      <Text style={{ color: '#EF4444' }}>- ₫ {fmt(viewRec.discount_amount)}</Text>
                    </div>
                  )}
                  {Number(viewRec.points_discount) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text type="secondary">Dùng điểm thưởng ({viewRec.points_used} điểm):</Text>
                      <Text style={{ color: '#EF4444' }}>- ₫ {fmt(viewRec.points_discount)}</Text>
                    </div>
                  )}
                  
                  <Divider style={{ margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 16 }}>TỔNG CỘNG:</Text>
                    <Text strong style={{ color: '#059669', fontSize: 20 }}>₫ {fmt(viewRec.total_amount)}</Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Drawer>
    </>
  );
}
