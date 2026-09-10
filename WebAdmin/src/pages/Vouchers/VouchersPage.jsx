import { useState } from "react";
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
  InputNumber,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { App } from "antd";
import dayjs from "dayjs";
import { useCrud } from "../../hooks/useCrud";
import { vouchersApi } from "../../api/services";

const { Text } = Typography;
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n);

const INIT = {
  code: "",
  discount_type: "PERCENT",
  discount_value: null,
  min_order_value: 0,
  max_discount_amount: null,
  usage_limit: null,
  date_range: null,
};

const voucherStatus = (v) => {
  const now = new Date();
  if (new Date(v.end_date) < now) return { label: "Hết hạn", color: "error" };
  if (new Date(v.start_date) > now)
    return { label: "Chưa bắt đầu", color: "warning" };
  return { label: "Đang hoạt động", color: "success" };
};

export default function VouchersPage() {
  const { message } = App.useApp();
  const crud = useCrud(vouchersApi);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue(INIT);
    setOpen(true);
  };

  const openEdit = (rec) => {
    setEditing(rec);
    form.setFieldsValue({
      code: rec.code,
      discount_type: rec.discount_type,
      discount_value: rec.discount_value,
      min_order_value: rec.min_order_value,
      max_discount_amount: rec.max_discount_amount,
      usage_limit: rec.usage_limit,
      date_range:
        rec.start_date && rec.end_date
          ? [dayjs(rec.start_date), dayjs(rec.end_date)]
          : null,
    });
    setOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const [start, end] = values.date_range || [];
      const payload = {
        code: values.code,
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        min_order_value: values.min_order_value ?? 0,
        max_discount_amount: values.max_discount_amount ?? null,
        usage_limit: values.usage_limit ?? null,
        start_date: start?.toISOString(),
        end_date: end?.toISOString(),
      };
      if (editing) await crud.update(editing.id, payload);
      else await crud.create(payload);
      setOpen(false);
    } catch (err) {
      if (err?.response) message.error(err.response.data?.message || "Lỗi");
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
              width: 30,
              height: 30,
              borderRadius: 6,
              flexShrink: 0,
              background: "rgba(114,46,209,0.1)",
              border: "1px solid rgba(114,46,209,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GiftOutlined style={{ color: "#722ed1", fontSize: 14 }} />
          </div>
          <Text code strong style={{ fontSize: 13, letterSpacing: 1 }}>
            {v}
          </Text>
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "discount_type",
      render: (v) => (
        <Tag color={v === "PERCENT" ? "blue" : "green"}>
          {v === "PERCENT" ? "Phần trăm" : "Số tiền"}
        </Tag>
      ),
    },
    {
      title: "Giá trị giảm",
      render: (_, rec) => (
        <Text strong style={{ color: "#689f38" }}>
          {rec.discount_type === "PERCENT"
            ? `${rec.discount_value}%`
            : `₫ ${fmt(rec.discount_value)}`}
        </Text>
      ),
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "min_order_value",
      render: (v) => (v > 0 ? `₫ ${fmt(v)}` : <Text type="secondary">—</Text>),
    },
    {
      title: "Đã dùng",
      render: (_, rec) => (
        <Text>
          {rec.used_count || 0} /{" "}
          {rec.usage_limit ?? <Text type="secondary">∞</Text>}
        </Text>
      ),
    },
    {
      title: "Hạn dùng",
      dataIndex: "end_date",
      render: (v) => (
        <Text type="secondary">{new Date(v).toLocaleDateString("vi-VN")}</Text>
      ),
    },
    {
      title: "Trạng thái",
      render: (_, rec) => {
        const s = voucherStatus(rec);
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      key: "actions",
      width: 90,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEdit(rec)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa voucher này?"
            okText="Xóa"
            okButtonProps={{ danger: true }}
            cancelText="Hủy"
            onConfirm={() => crud.remove(rec.id)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="page-header-row">
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Vouchers
          </Typography.Title>
          <Text type="secondary">Quản lý mã giảm giá</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          id="create-voucher-btn"
        >
          Tạo voucher
        </Button>
      </div>

      <Card variant="outlined" style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm mã voucher..."
            value={crud.search}
            onChange={(e) => crud.handleSearch(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
        </div>
        <Table
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
            showTotal: (t, r) => `${r[0]} / ${t}`,
          }}
        />
      </Card>

      <Modal
        open={open}
        title={editing ? "Chỉnh sửa Voucher" : "Tạo Voucher mới"}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okText={editing ? "Lưu" : "Tạo"}
        cancelText="Hủy"
        confirmLoading={saving}
        width={560}
        destroyOnHide
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Mã voucher"
            name="code"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="SUMMER20"
              style={{
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
              onChange={(e) =>
                form.setFieldValue("code", e.target.value.toUpperCase())
              }
            />
          </Form.Item>
          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              label="Loại giảm"
              name="discount_type"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Select
                options={[
                  { label: "Phần trăm (%)", value: "PERCENT" },
                  { label: "Số tiền (₫)", value: "AMOUNT" },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="Giá trị giảm"
              name="discount_value"
              rules={[{ required: true }]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <InputNumber style={{ width: "100%" }} min={0} placeholder="20" />
            </Form.Item>
          </Space>
          <Space style={{ width: "100%", marginTop: 16 }} size={12}>
            <Form.Item
              label="Đơn tối thiểu (₫)"
              name="min_order_value"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                placeholder="200,000"
              />
            </Form.Item>
            <Form.Item
              label="Giảm tối đa (₫)"
              name="max_discount_amount"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                placeholder="Không giới hạn"
              />
            </Form.Item>
          </Space>
          <Space style={{ width: "100%", marginTop: 16 }} size={12}>
            <Form.Item
              label="Giới hạn lượt dùng"
              name="usage_limit"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                placeholder="Không giới hạn"
              />
            </Form.Item>
          </Space>
          <Form.Item
            label="Thời gian hiệu lực"
            name="date_range"
            rules={[{ required: true, message: "Chọn thời gian" }]}
            style={{ marginTop: 16 }}
          >
            <DatePicker.RangePicker
              showTime
              style={{ width: "100%" }}
              format="DD/MM/YYYY HH:mm"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
