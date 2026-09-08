import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import { usersApi } from "../../api/services";
import { useCrud } from "../../hooks/useCrud";

const { Text } = Typography;

const ROLE_COLOR = { ADMIN: "red", STAFF: "blue", CUSTOMER: "default" };
const ROLE_LABEL = { ADMIN: "Admin", STAFF: "Staff", CUSTOMER: "Khách hàng" };

const INIT = {
  email: "",
  password_hash: "",
  full_name: "",
  phone_number: "",
  avatar_url: "",
  role: "CUSTOMER",
  is_active: true,
};

export default function UsersPage() {
  const { message } = App.useApp();
  const crud = useCrud(usersApi);
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
      email: rec.email,
      password_hash: "",
      full_name: rec.full_name,
      phone_number: rec.phone_number || "",
      avatar_url: rec.avatar_url || "",
      role: rec.role,
      is_active: rec.is_active,
    });
    setOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = { ...values };
      if (!payload.password_hash) delete payload.password_hash;
      if (editing) await crud.update(editing.id, payload);
      else await crud.create(payload);
      setOpen(false);
    } catch (err) {
      if (err?.response) message.error(err.response.data?.message || "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  const initials = (name) =>
    name
      ?.trim()
      .split(" ")
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?";

  const columns = [
    {
      title: "Người dùng",
      dataIndex: "full_name",
      render: (name, rec) => (
        <Space>
          {/* Sử dụng prop 'src' của antd thay vì style background */}
          <Avatar
            src={rec.avatar_url || undefined}
            style={{
              backgroundColor: "#999999",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {initials(name)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {rec.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      render: (v) => v || <Text type="secondary">—</Text>,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: (v) => (
        <Tag color={ROLE_COLOR[v] || "default"}>{ROLE_LABEL[v] || v}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      render: (v) =>
        v ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Hoạt động
          </Tag>
        ) : (
          <Tag icon={<StopOutlined />} color="error">
            Bị khóa
          </Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      render: (v) => (
        <Text type="secondary">{new Date(v).toLocaleDateString("vi-VN")}</Text>
      ),
    },
    {
      title: "",
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
            title="Xóa người dùng này?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            okButtonProps={{ danger: true }}
            cancelText="Hủy"
            onConfirm={() => crud.remove(rec.id)}
          >
            <Tooltip title="Xóa">
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
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
            Người dùng
          </Typography.Title>
          <Text type="secondary">
            Quản lý tài khoản người dùng trong hệ thống
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          id="create-user-btn"
        >
          Thêm người dùng
        </Button>
      </div>

      <Card variant="outlined" style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên, email..."
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
            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total}`,
          }}
        />
      </Card>

      <Modal
        open={open}
        title={editing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okText={editing ? "Lưu thay đổi" : "Tạo"}
        cancelText="Hủy"
        confirmLoading={saving}
        width={540}
        destroyOnHide
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Họ và tên"
            name="full_name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true }, { type: "email" }]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item
            label={
              editing ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"
            }
            name="password_hash"
            rules={editing ? [] : [{ required: true, min: 6 }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              label="Số điện thoại"
              name="phone_number"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Input placeholder="0901234567" />
            </Form.Item>
            <Form.Item
              label="Vai trò"
              name="role"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Select
                options={[
                  { label: "Khách hàng", value: "CUSTOMER" },
                  { label: "Staff", value: "STAFF" },
                  { label: "Admin", value: "ADMIN" },
                ]}
              />
            </Form.Item>
          </Space>
          <Form.Item
            label="Avatar URL"
            name="avatar_url"
            style={{ marginTop: 16 }}
          >
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="is_active"
            valuePropName="checked"
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
