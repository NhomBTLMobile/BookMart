import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  Tag,
  Tooltip,
  Popconfirm,
  Typography,
  Descriptions,
  Divider,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined
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

const PAYMENT_STATUS = {
  unpaid: { label: "Chưa thanh toán", color: "warning" },
  paid: { label: "Đã thanh toán", color: "#059669" },
  refunded: { label: "Hoàn tiền", color: "default" },
};

const statusColor = (v) => {
  const st = ORDER_STATUS_OPTIONS.find((o) => o.value === String(v).toLowerCase());
  return st ? st.color : "default";
};

const statusLabel = (v) => {
  const st = ORDER_STATUS_OPTIONS.find((o) => o.value === String(v).toLowerCase());
  return st ? st.label : v;
};

export default function OrdersPage() {
  const { user, isDark } = useAuth();
  const { message } = App.useApp();
  const crud = useCrud(ordersApi);
  const [editForm] = Form.useForm();
  const [viewRec, setViewRec] = useState(null);
  const [editRec, setEditRec] = useState(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (rec) => {
    setEditRec(rec);
    editForm.setFieldsValue({ order_status: rec.order_status?.toLowerCase() });
  };

  const handleSave = async () => {
    const values = await editForm.validateFields();
    setSaving(true);
    try {
      await crud.update(editRec.id, values);
      setEditRec(null);
      message.success("Cập nhật trạng thái đơn hàng thành công");
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  const loadOrderDetail = async (id) => {
    try {
      const res = await ordersApi.getById(id);
      if (res.data?.success) {
        setViewRec(res.data.data);
      }
    } catch (err) {
      message.error("Lỗi khi tải chi tiết đơn hàng");
    }
  }

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "order_code",
      width: 140,
      render: (v) => (
        <Text code style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>
          #{v || "BM-ORDER"}
        </Text>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer_name",
      render: (v, rec) => (
        <div>
          <Text strong style={{ display: 'block' }}>{v || "Khách vãng lai"}</Text>
          {rec.customer_phone && <Text type="secondary" style={{ fontSize: 12 }}>{rec.customer_phone}</Text>}
        </div>
      ),
    },
    {
      title: "Tổng thanh toán",
      dataIndex: "total_amount",
      align: 'right',
      render: (v) => (
        <Text strong style={{ color: "#059669", fontSize: 14 }}>
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
        const key = String(v).toLowerCase();
        const s = PAYMENT_STATUS[key] || { label: v, color: "default" };
        return <Tag color={s.color} style={{ borderRadius: 12 }}>{s.label}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "order_status",
      align: 'center',
      render: (v) => <Tag color={statusColor(v)} style={{ borderRadius: 12 }}>{statusLabel(v)}</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      align: 'center',
      render: (v) => (
        <Text type="secondary" style={{ fontSize: 12 }}>{new Date(v).toLocaleDateString("vi-VN")}</Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      align: 'center',
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              ghost
              icon={<EyeOutlined />}
              size="small"
              onClick={() => loadOrderDetail(rec.id)}
            />
          </Tooltip>
          <Tooltip title="Cập nhật trạng thái">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEdit(rec)}
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
              <Button icon={<DeleteOutlined />} size="small" danger />
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
      width: 60,
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
      title: 'Số lượng',
      dataIndex: 'quantity',
      align: 'center',
      render: v => <Text strong>{v}</Text>
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total_price',
      align: 'right',
      render: v => <Text strong style={{ color: isDark ? '#fff' : '#0f172a' }}>₫ {fmt(v)}</Text>
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
      <div className="page-header-row">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Quản lý Đơn hàng
          </Title>
          <Text type="secondary">Quản lý, duyệt đơn và theo dõi trạng thái giao hàng</Text>
        </div>
      </div>

      <Card variant="outlined" style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo mã đơn hàng..."
            value={crud.search}
            onChange={(e) => crud.handleSearch(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
        </div>
        <Table scroll={{ x: 'max-content' }}
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
            showTotal: null,
          }}
        />
      </Card>

      {/* View Detail Modal */}
      <Modal
        open={!!viewRec}
        title={<Title level={5} style={{ margin: 0 }}>Chi tiết Đơn hàng {viewRec && <Text code>#{viewRec.order_code}</Text>}</Title>}
        footer={[
          <Button key="close" onClick={() => setViewRec(null)}>Đóng</Button>,
          <Button key="edit" type="primary" onClick={() => { setViewRec(null); openEdit(viewRec); }}>
            Cập nhật trạng thái
          </Button>
        ]}
        onCancel={() => setViewRec(null)}
        width={800}
        destroyOnClose
        style={{ top: 20 }}
      >
        {viewRec && (
          <div style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" title="Thông tin khách hàng" variant="outlined" style={{ height: '100%', background: isDark ? '#27272A' : '#ffffff' }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div><UserOutlined /> <Text strong>{viewRec.customer_name || 'Khách vãng lai'}</Text></div>
                    {viewRec.customer_phone && <div><PhoneOutlined /> <Text type="secondary">{viewRec.customer_phone}</Text></div>}
                    {viewRec.customer_email && <div><MailOutlined /> <Text type="secondary">{viewRec.customer_email}</Text></div>}
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Thông tin giao hàng" variant="outlined" style={{ height: '100%', background: isDark ? '#27272A' : '#ffffff' }}>
                  {addressInfo ? (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div><Text strong>{addressInfo.full_name || viewRec.customer_name}</Text> - <Text type="secondary">{addressInfo.phone || viewRec.customer_phone}</Text></div>
                      <div><Text type="secondary">{addressInfo.full_address || addressInfo.street_address}</Text></div>
                    </Space>
                  ) : (
                    <Text type="secondary">Sử dụng địa chỉ đăng ký</Text>
                  )}
                </Card>
              </Col>
            </Row>

            <Divider orientation="left">Sản phẩm đã đặt</Divider>
            <Table
              dataSource={viewRec.items || []}
              columns={itemColumns}
              rowKey="id"
              pagination={false}
              size="small"
              bordered
            />

            <Row justify="end" style={{ marginTop: 16 }}>
              <Col xs={24} sm={16} md={10}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">Tạm tính:</Text>
                  <Text>₫ {fmt(viewRec.subtotal || viewRec.total_amount)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">Phí vận chuyển:</Text>
                  <Text>₫ {fmt(viewRec.shipping_fee || 0)}</Text>
                </div>
                {Number(viewRec.discount_amount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Giảm giá:</Text>
                    <Text type="danger">- ₫ {fmt(viewRec.discount_amount)}</Text>
                  </div>
                )}
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Tổng cộng:</Text>
                  <Text strong style={{ color: '#059669', fontSize: 16 }}>₫ {fmt(viewRec.total_amount)}</Text>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Edit Status Modal */}
      <Modal
        open={!!editRec}
        title="Cập nhật trạng thái đơn hàng"
        onOk={handleSave}
        onCancel={() => setEditRec(null)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        confirmLoading={saving}
        destroyOnHide
      >
        {editRec && (
          <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 16 }}>
              Mã đơn hàng: <Text code>#{editRec.order_code}</Text>
            </div>
            <Form.Item
              label="Trạng thái đơn hàng"
              name="order_status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select
                options={ORDER_STATUS_OPTIONS.map((o) => ({
                  label: <Tag color={o.color}>{o.label}</Tag>,
                  value: o.value,
                }))}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
}

