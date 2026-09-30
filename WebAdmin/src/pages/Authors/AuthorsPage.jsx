import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Drawer,
  Form,
  Avatar,
  Tooltip,
  Popconfirm,
  Typography,
  Row,
  Col,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { App } from "antd";
import { useCrud } from "../../hooks/useCrud";
import { authorsApi } from "../../api/services";

const { Text, Title } = Typography;
const INIT = { name: "", slug: "", bio: "", avatar_url: "" };

const generateSlug = (str) => {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const initials = (name) =>
  name
    ?.trim()
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

export default function AuthorsPage() {
  const { message } = App.useApp();
  const crud = useCrud(authorsApi);
  const [form] = Form.useForm();
  
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue(INIT);
    setOpen(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    form.setFieldsValue({
      name: r.name,
      slug: r.slug || "",
      bio: r.bio || "",
      avatar_url: r.avatar_url || "",
    });
    setOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await crud.update(editing.id, values);
        message.success('Cập nhật tác giả thành công');
      } else {
        await crud.create(values);
        message.success('Thêm tác giả mới thành công');
      }
      setOpen(false);
    } catch (err) {
      if (err?.response) message.error(err.response.data?.message || 'Lỗi từ máy chủ');
      else if (err.errorFields) message.error('Vui lòng kiểm tra lại các trường thông tin');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Tác giả",
      dataIndex: "name",
      width: 250,
      render: (name, rec) => (
        <Space size={12}>
          {rec.avatar_url ? (
            <Avatar src={rec.avatar_url} size={42} style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
          ) : (
            <Avatar
              size={42}
              style={{
                background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.7), rgba(52, 211, 153, 0.8))',
                fontWeight: 700,
                color: '#fff',
                border: '2px solid rgba(5, 150, 105, 0.2)'
              }}
            >
              {initials(name)}
            </Avatar>
          )}
          <div>
            <Text strong style={{ fontSize: 14, display: 'block' }} className="theme-text">{name}</Text>
            {rec.slug && <Text type="secondary" style={{ fontSize: 12 }}>@{rec.slug}</Text>}
          </div>
        </Space>
      ),
    },
    {
      title: "Tiểu sử",
      dataIndex: "bio",
      ellipsis: true,
      render: (v) =>
        v ? <Text type="secondary">{v}</Text> : <Text type="secondary">—</Text>,
    },

    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, rec) => (
        <Space size={8}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#3B82F6' }} />}
              onClick={() => openEdit(rec)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa tác giả này?"
            okText="Xóa"
            okButtonProps={{ danger: true }}
            cancelText="Hủy"
            onConfirm={() => crud.remove(rec.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>
            Quản lý Tác giả
          </Title>
          <Text type="secondary">Danh sách tác giả và các thông tin tiểu sử</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ background: '#059669', height: 40, borderRadius: 8, fontWeight: 600 }}
        >
          Thêm tác giả
        </Button>
      </div>

      <Card variant="outlined" style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} bodyStyle={{ padding: 20 }}>
        <div style={{ marginBottom: 20, display: 'flex', gap: 16 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm kiếm tác giả..."
            value={crud.search}
            onChange={(e) => crud.handleSearch(e.target.value)}
            style={{ width: 320, borderRadius: 8, height: 40 }}
            allowClear
          />
        </div>
        <Table scroll={{ x: 700 }}
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
        title={<span style={{ fontFamily: "'Inter', sans-serif", fontSize: 20 }}>{editing ? 'Chỉnh sửa Tác giả' : 'Thêm Tác giả Mới'}</span>}
        width={500}
        onClose={() => setOpen(false)}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={() => setOpen(false)} style={{ borderRadius: 6 }}>Hủy</Button>
            <Button onClick={handleOk} type="primary" loading={saving} style={{ background: '#059669', borderRadius: 6, fontWeight: 600 }}>
              {editing ? 'Lưu thay đổi' : 'Tạo tác giả'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Divider orientation="left" style={{ borderColor: '#34D399', color: '#059669' }}>Hồ sơ Tác giả</Divider>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Tên tác giả"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên tác giả' }]}
              >
                <Input size="large" placeholder="Ví dụ: Nguyễn Nhật Ánh" onChange={(e) => form.setFieldsValue({ slug: generateSlug(e.target.value) })} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Đường dẫn ảo (Slug)"
                name="slug"
                rules={[{ required: true, message: 'Slug không được để trống' }]}
              >
                <Input placeholder="nguyen-nhat-anh" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Link Ảnh đại diện (Avatar)" name="avatar_url">
                <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="https://..." />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Tiểu sử" name="bio">
                <Input.TextArea rows={5} placeholder="Nhập tiểu sử, thông tin chi tiết về tác giả..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
}
