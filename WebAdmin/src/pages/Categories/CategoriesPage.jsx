import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Drawer,
  Form,
  InputNumber,
  Switch,
  Tooltip,
  Popconfirm,
  Typography,
  Row,
  Col,
  Divider,
  Tag
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TagOutlined,
  PictureOutlined
} from "@ant-design/icons";
import { App } from "antd";
import { useCrud } from "../../hooks/useCrud";
import { categoriesApi } from "../../api/services";

const { Text, Title } = Typography;
const INIT = { name: "", slug: "", icon_url: "", sort_order: 0, is_active: true };

const generateSlug = (str) => {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const PALETTE = [
  "#059669", "#1677ff", "#722ed1", "#fa8c16", "#f5222d", "#13c2c2", "#eb2f96", "#2f54eb"
];
const catColor = (name) => PALETTE[(name?.charCodeAt(0) || 0) % PALETTE.length];

export default function CategoriesPage() {
  const { message } = App.useApp();
  const crud = useCrud(categoriesApi);
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
      icon_url: r.icon_url || "",
      sort_order: r.sort_order || 0,
      is_active: r.is_active ?? true,
    });
    setOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await crud.update(editing.id, values);
        message.success('Cập nhật thể loại thành công');
      } else {
        await crud.create(values);
        message.success('Thêm thể loại mới thành công');
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
      title: "Thể loại",
      dataIndex: "name",
      width: 250,
      render: (name, rec) => (
        <Space size={12}>
          {rec.icon_url ? (
            <img src={rec.icon_url} alt={name} style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
          ) : (
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                flexShrink: 0,
                background: catColor(name) + "1a",
                border: `1px solid ${catColor(name)}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TagOutlined style={{ color: catColor(name), fontSize: 18 }} />
            </div>
          )}
          <div>
            <Text strong style={{ fontSize: 14, display: 'block' }} className="theme-text">{name}</Text>
            {rec.slug && <Text type="secondary" style={{ fontSize: 12 }}>/{rec.slug}</Text>}
          </div>
        </Space>
      ),
    },
    {
      title: "Thứ tự",
      dataIndex: "sort_order",
      width: 100,
      align: "center",
      render: (v) => <Text strong>{v || 0}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      width: 120,
      align: "center",
      render: (v) => (
        <Tag color={v ? '#059669' : 'default'} style={{ borderRadius: 4, textTransform: 'uppercase', fontSize: 11 }}>
          {v ? 'Hiển thị' : 'Đã ẩn'}
        </Tag>
      ),
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
            title="Xóa thể loại này?"
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
            Quản lý Danh mục
          </Title>
          <Text type="secondary">Quản lý và sắp xếp các thể loại sách</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ background: '#059669', height: 40, borderRadius: 8, fontWeight: 600 }}
        >
          Thêm thể loại
        </Button>
      </div>

      <Card variant="outlined" style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} bodyStyle={{ padding: 20 }}>
        <div style={{ marginBottom: 20, display: 'flex', gap: 16 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm kiếm thể loại..."
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
        title={<span style={{ fontFamily: "'Inter', sans-serif", fontSize: 20 }}>{editing ? 'Chỉnh sửa Thể loại' : 'Thêm Thể loại Mới'}</span>}
        width={500}
        onClose={() => setOpen(false)}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={() => setOpen(false)} style={{ borderRadius: 6 }}>Hủy</Button>
            <Button onClick={handleOk} type="primary" loading={saving} style={{ background: '#059669', borderRadius: 6, fontWeight: 600 }}>
              {editing ? 'Lưu thay đổi' : 'Tạo thể loại'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Divider orientation="left" style={{ borderColor: '#34D399', color: '#059669' }}>Thông tin Danh mục</Divider>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Tên thể loại"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên thể loại' }]}
              >
                <Input size="large" placeholder="Ví dụ: Văn học, Kỹ năng sống..." onChange={(e) => form.setFieldsValue({ slug: generateSlug(e.target.value) })} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Đường dẫn ảo (Slug)"
                name="slug"
                rules={[{ required: true, message: 'Slug không được để trống' }]}
              >
                <Input placeholder="van-hoc" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Link Ảnh/Icon minh họa" name="icon_url">
                <Input prefix={<PictureOutlined style={{ color: '#94a3b8' }} />} placeholder="https://..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Thứ tự hiển thị" name="sort_order">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Ví dụ: 1, 2, 3" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái" name="is_active" valuePropName="checked">
                <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
}
