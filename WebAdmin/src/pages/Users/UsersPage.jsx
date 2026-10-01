import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  StopOutlined,
  UserOutlined,
  GiftOutlined,
  PhoneOutlined,
  MailOutlined
} from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Drawer,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  Row,
  Col,
  Divider,
  InputNumber
} from "antd";
import { useState } from "react";
import { usersApi } from "../../api/services";
import { useCrud } from "../../hooks/useCrud";
import { useAuth } from "../../context/AuthContext";

const { Text, Title } = Typography;

const ROLE_COLOR = { admin: "red", staff: "blue", customer: "default" };
const ROLE_LABEL = { admin: "Admin", staff: "Staff", customer: "Khách hàng" };

const INIT = {
  email: "",
  password_hash: "",
  full_name: "",
  phone: "",
  avatar_url: "",
  role: "customer",
  loyalty_points: 0,
  is_verified: false,
  is_active: true,
};

export default function UsersPage() {
  const { isDark, user: currentUser } = useAuth();
  const { message } = App.useApp();
  const crud = useCrud(usersApi);
  const [form] = Form.useForm();
  
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Watch for avatar preview
  const avatarUrl = Form.useWatch('avatar_url', form);

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
      phone: rec.phone || "",
      avatar_url: rec.avatar_url || "",
      role: rec.role || "customer",
      loyalty_points: rec.loyalty_points || 0,
      is_verified: rec.is_verified || false,
      is_active: rec.is_active !== false, // default true
    });
    setOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = { ...values };
      // Nếu không điền password thì không cập nhật
      if (!payload.password_hash) delete payload.password_hash;
      
      if (editing) await crud.update(editing.id, payload);
      else await crud.create(payload);
      setOpen(false);
      message.success(editing ? "Cập nhật người dùng thành công" : "Tạo người dùng thành công");
    } catch (err) {
      if (err?.response) message.error(err.response.data?.message || "Có lỗi xảy ra khi lưu");
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
        <Space size={12}>
          <Avatar
            size={40}
            src={rec.avatar_url || undefined}
            style={{
              backgroundColor: "#059669",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {initials(name)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {rec.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      render: (v) => v ? <Text>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: (v) => (
        <Tag color={ROLE_COLOR[v] || "default"} style={{ borderRadius: 12, fontWeight: 500 }}>{ROLE_LABEL[v] || v}</Tag>
      ),
    },
    {
      title: "Điểm thưởng",
      dataIndex: "loyalty_points",
      align: "center",
      render: (v) => (
        <Tag icon={<GiftOutlined />} color="purple" style={{ borderRadius: 12 }}>{v || 0}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      render: (v) =>
        v ? (
          <Tag icon={<CheckCircleOutlined />} color="#059669" style={{ borderRadius: 12 }}>
            Hoạt động
          </Tag>
        ) : (
          <Tag icon={<StopOutlined />} color="error" style={{ borderRadius: 12 }}>
            Bị khóa
          </Tag>
        ),
    },
    {
      title: "Xác thực",
      dataIndex: "is_verified",
      align: 'center',
      render: (v) =>
        v ? <CheckCircleOutlined style={{ color: '#059669' }} /> : <Text type="secondary">—</Text>,
    },
    {
      title: "",
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
          {currentUser?.role === "admin" && currentUser?.id !== rec.id && (
            <Popconfirm
              title="Khóa/Xóa người dùng này?"
              description="Bạn có chắc chắn muốn thực hiện hành động này?"
              okText="Đồng ý"
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
            Quản lý Người dùng
          </Title>
          <Text type="secondary">
            Quản lý tài khoản, vai trò và điểm thưởng của thành viên
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ background: '#059669', height: 40, borderRadius: 8, fontWeight: 500 }}
        >
          Thêm người dùng
        </Button>
      </div>

      <Card variant="outlined" style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} styles={{ body: { padding: 20 } }}>
        <div style={{ marginBottom: 20 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm theo tên, email, sđt..."
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
        title={<span style={{ fontFamily: "'Inter', sans-serif", fontSize: 20 }}>{editing ? "Chỉnh sửa Tài khoản" : "Tạo Tài khoản mới"}</span>}
        width={540}
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
          
          <Card variant="outlined" style={{ borderRadius: 12, marginBottom: 16, background: isDark ? '#27272A' : '#ffffff', border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}` }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              <Avatar 
                size={72} 
                src={avatarUrl}
                icon={<UserOutlined />}
                style={{ background: '#059669', flexShrink: 0 }}
              />
              <Form.Item
                label="Avatar URL"
                name="avatar_url"
                style={{ margin: 0, flex: 1 }}
              >
                <Input placeholder="https://..." allowClear />
              </Form.Item>
            </div>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Họ và tên</span>}
                  name="full_name"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input prefix={<UserOutlined style={{ color: '#9ca3af' }} />} placeholder="Vd: Nguyễn Văn A" size="large" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card variant="outlined" title={<span style={{ color: '#059669' }}>Bảo mật & Liên hệ</span>} style={{ borderRadius: 12, marginBottom: 16, background: isDark ? '#27272A' : '#ffffff', border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}` }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Email</span>}
                  name="email"
                  rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: "email", message: 'Email không hợp lệ' }]}
                >
                  <Input prefix={<MailOutlined style={{ color: '#9ca3af' }} />} placeholder="email@example.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Số điện thoại</span>}
                  name="phone"
                >
                  <Input prefix={<PhoneOutlined style={{ color: '#9ca3af' }} />} placeholder="0901234567" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>{editing ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}</span>}
                  name="password_hash"
                  rules={editing ? [] : [{ required: true, min: 6, message: 'Mật khẩu ít nhất 6 ký tự' }]}
                  extra={editing ? "Mật khẩu sẽ được mã hóa tự động khi lưu." : ""}
                >
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card variant="outlined" title={<span style={{ color: '#059669' }}>Cài đặt hệ thống</span>} style={{ borderRadius: 12, marginBottom: 16, background: isDark ? '#27272A' : '#ffffff', border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}` }}>
            <Row gutter={16} align="middle">
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Vai trò</span>}
                  name="role"
                >
                  <Select
                    options={[
                      { label: "Khách hàng", value: "customer" },
                      { label: "Nhân viên (Staff)", value: "staff" },
                      { label: "Quản trị viên (Admin)", value: "admin" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Điểm thưởng</span>}
                  name="loyalty_points"
                >
                  <InputNumber min={0} style={{ width: '100%' }} addonBefore={<GiftOutlined style={{ color: '#8b5cf6' }}/>} />
                </Form.Item>
              </Col>
            </Row>

            <Divider style={{ margin: '12px 0' }} />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="is_active"
                  valuePropName="checked"
                  style={{ margin: 0 }}
                >
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm khóa" />
                </Form.Item>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Cho phép đăng nhập</Text>
                </div>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="is_verified"
                  valuePropName="checked"
                  style={{ margin: 0 }}
                >
                  <Switch checkedChildren="Đã xác thực" unCheckedChildren="Chưa xác thực" />
                </Form.Item>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Xác thực Email/SĐT</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Form>
      </Drawer>
    </>
  );
}
