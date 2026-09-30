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
  InputNumber,
  DatePicker,
  Row,
  Col,
  Switch,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { App } from "antd";
import dayjs from "dayjs";
import { useCrud } from "../../hooks/useCrud";
import { vouchersApi } from "../../api/services";
import { useAuth } from "../../context/AuthContext";

const { Text, Title } = Typography;
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n || 0);

const INIT = {
  code: "",
  type: "percentage",
  value: null,
  min_order_value: 0,
  max_discount: null,
  usage_limit: null,
  ends_at: null,
  is_active: true,
};

const voucherStatus = (v) => {
  if (!v.is_active) return { label: "Ngừng hoạt động", color: "error" };
  const now = new Date();
  if (v.ends_at && new Date(v.ends_at) < now) return { label: "Hết hạn", color: "error" };
  return { label: "Đang hoạt động", color: "#059669" };
};

export default function VouchersPage() {
  const { isDark, user: currentUser } = useAuth();
  const { message } = App.useApp();
  const crud = useCrud(vouchersApi);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Watch for dynamic rendering in Form
  const typeValue = Form.useWatch('type', form);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue(INIT);
    setOpen(true);
  };

  const openEdit = (rec) => {
    setEditing(rec);
    form.setFieldsValue({
      code: rec.code,
      type: rec.type?.toLowerCase() === "fixed" ? "fixed" : "percentage",
      value: rec.value,
      min_order_value: rec.min_order_value,
      max_discount: rec.max_discount,
      usage_limit: rec.usage_limit,
      ends_at: rec.ends_at ? dayjs(rec.ends_at) : null,
      is_active: rec.is_active !== false,
    });
    setOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        code: values.code,
        type: values.type,
        value: values.value,
        min_order_value: values.min_order_value || 0,
        max_discount: values.type === 'percentage' ? (values.max_discount || null) : null,
        usage_limit: values.usage_limit || null,
        ends_at: values.ends_at ? values.ends_at.toISOString() : null,
        is_active: values.is_active,
      };
      if (editing) await crud.update(editing.id, payload);
      else await crud.create(payload);
      setOpen(false);
      message.success(editing ? "Cập nhật mã giảm giá thành công" : "Tạo mã giảm giá thành công");
    } catch (err) {
      if (err?.response) message.error(err.response.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Mã voucher",
      dataIndex: "code",
      render: (v) => (
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              flexShrink: 0,
              background: "rgba(5, 150, 105, 0.1)",
              border: "1px solid rgba(5, 150, 105, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GiftOutlined style={{ color: "#059669", fontSize: 16 }} />
          </div>
          <Text code strong style={{ fontSize: 13, letterSpacing: 1, color: '#059669', background: 'transparent', border: 'none' }}>
            {v}
          </Text>
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      render: (v) => (
        <Tag color={String(v).toLowerCase() === "percentage" ? "blue" : "purple"} style={{ borderRadius: 12, fontWeight: 500 }}>
          {String(v).toLowerCase() === "percentage" ? "Phần trăm" : "Số tiền"}
        </Tag>
      ),
    },
    {
      title: "Mức giảm",
      render: (_, rec) => (
        <Text strong style={{ color: "#059669" }}>
          {String(rec.type).toLowerCase() === "percentage"
            ? `${rec.value}%`
            : `₫ ${fmt(rec.value)}`}
        </Text>
      ),
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "min_order_value",
      render: (v) => (v > 0 ? `₫ ${fmt(v)}` : <Text type="secondary">—</Text>),
    },
    {
      title: "Sử dụng",
      render: (_, rec) => (
        <Space direction="vertical" size={0}>
          <Text strong>{rec.used_count || 0} <Text type="secondary" style={{ fontWeight: 400 }}>đã dùng</Text></Text>
          {rec.usage_limit && <Text type="secondary" style={{ fontSize: 11 }}>Tối đa: {fmt(rec.usage_limit)}</Text>}
        </Space>
      ),
    },
    {
      title: "Hạn dùng",
      dataIndex: "ends_at",
      render: (v) => (
        v ? <Text type="secondary">{new Date(v).toLocaleDateString("vi-VN")}</Text> : <Text type="secondary">Không giới hạn</Text>
      ),
    },
    {
      title: "Trạng thái",
      render: (_, rec) => {
        const s = voucherStatus(rec);
        return <Tag color={s.color} style={{ borderRadius: 12 }}>{s.label}</Tag>;
      },
    },
    {
      key: "actions",
      width: 90,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#059669' }} />}
              onClick={() => openEdit(rec)}
            />
          </Tooltip>
          {currentUser?.role === "ADMIN" && (
            <Popconfirm
              title="Xóa mã giảm giá này?"
              description="Hành động này không thể hoàn tác."
              okText="Xóa"
              okButtonProps={{ danger: true }}
              cancelText="Hủy"
              onConfirm={() => crud.remove(rec.id)}
            >
              <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>
            Quản lý Mã giảm giá
          </Title>
          <Text type="secondary">Tạo và phân phối Voucher cho khách hàng</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ background: '#059669', height: 40, borderRadius: 8, fontWeight: 500 }}
        >
          Tạo mã giảm giá
        </Button>
      </div>

      <Card variant="outlined" style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} styles={{ body: { padding: 20 } }}>
        <div style={{ marginBottom: 20 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm theo mã voucher..."
            value={crud.search}
            onChange={(e) => crud.handleSearch(e.target.value)}
            style={{ width: 320, borderRadius: 8, height: 40 }}
            allowClear
          />
        </div>
        <Table scroll={{ x: 1000 }}
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
        title={<span style={{ fontFamily: "'Inter', sans-serif", fontSize: 20 }}>{editing ? "Chỉnh sửa Mã giảm giá" : "Tạo Mã giảm giá mới"}</span>}
        width={560}
        onClose={() => setOpen(false)}
        open={open}
        styles={{ body: { paddingBottom: 80, background: isDark ? '#18181B' : '#F9FAFB' } }}
        extra={
          <Space>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={handleOk} type="primary" loading={saving} style={{ background: '#059669' }}>
              {editing ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          
          <Card variant="outlined" title={<span style={{ color: '#059669' }}>Thông tin cơ bản</span>} style={{ borderRadius: 12, marginBottom: 16, background: isDark ? '#27272A' : '#ffffff', border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}` }}>
            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Mã voucher</span>}
              name="code"
              rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
              extra="Ví dụ: SUMMER2026, FREESHIP"
            >
              <Input
                size="large"
                placeholder="NHAP_MA_VOUCHER"
                style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  borderRadius: 8
                }}
                onChange={(e) =>
                  form.setFieldValue("code", e.target.value.toUpperCase())
                }
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Loại giảm giá</span>}
                  name="type"
                >
                  <Select
                    options={[
                      { label: "Theo phần trăm (%)", value: "percentage" },
                      { label: "Theo số tiền (₫)", value: "fixed" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Giá trị giảm</span>}
                  name="value"
                  rules={[{ required: true, message: 'Nhập giá trị' }]}
                >
                  <InputNumber 
                    style={{ width: "100%" }} 
                    min={0} 
                    max={typeValue === 'percentage' ? 100 : undefined}
                    placeholder={typeValue === 'percentage' ? "Ví dụ: 15" : "Ví dụ: 50000"} 
                    addonAfter={typeValue === 'percentage' ? "%" : "₫"}
                    formatter={typeValue === 'fixed' ? (v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : undefined}
                    parser={typeValue === 'fixed' ? (v) => v.replace(/\$\s?|(,*)/g, "") : undefined}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card variant="outlined" title={<span style={{ color: '#059669' }}>Điều kiện sử dụng</span>} style={{ borderRadius: 12, marginBottom: 16, background: isDark ? '#27272A' : '#ffffff', border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}` }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Đơn tối thiểu (₫)</span>}
                  name="min_order_value"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
                    placeholder="200,000"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Giảm tối đa (₫)</span>}
                  name="max_discount"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    disabled={typeValue === 'fixed'}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
                    placeholder={typeValue === 'fixed' ? "Không áp dụng" : "Không giới hạn"}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider style={{ margin: '8px 0 24px 0' }} />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Giới hạn lượt dùng</span>}
                  name="usage_limit"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="Không giới hạn"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Hạn sử dụng</span>}
                  name="ends_at"
                >
                  <DatePicker
                    showTime
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Không giới hạn"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="is_active"
              valuePropName="checked"
              style={{ margin: 0, marginTop: 8 }}
            >
              <Switch checkedChildren="Cho phép sử dụng" unCheckedChildren="Tạm dừng" />
            </Form.Item>
          </Card>
        </Form>
      </Drawer>
    </>
  );
}
