import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Input, Space, Drawer, Form, InputNumber, Select,
  Tag, Switch, Tooltip, Popconfirm, Typography, Row, Col, Divider
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  BookOutlined, BarcodeOutlined, InboxOutlined
} from '@ant-design/icons';
import { App } from 'antd';
import { useCrud } from '../../hooks/useCrud';
import { booksApi, authorsApi, categoriesApi, publishersApi } from '../../api/services';

const { Text, Title } = Typography;
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n || 0);

// Utils
const generateSlug = (str) => {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const INIT = {
  title: '',
  slug: '',
  isbn: '',
  barcode: '',
  publisher_id: null,
  format: 'soft_cover',
  original_price: 0,
  sale_price: 0,
  stock_qty: 0,
  weight_grams: 0,
  length_cm: 0,
  width_cm: 0,
  height_cm: 0,
  warehouse_location: '',
  is_active: true,
  author_ids: [],
  category_ids: [],
  image_url: '',
};

const getFormatLabel = (val) => {
  if (!val) return 'N/A';
  const v = val.toLowerCase();
  if (v === 'soft_cover' || v === 'bia mem' || v === 'bìa mềm') return 'Bìa mềm';
  if (v === 'hard_cover' || v === 'bia cung' || v === 'bìa cứng') return 'Bìa cứng';
  if (v === 'ebook') return 'Sách điện tử';
  return val;
};

export default function BooksPage() {
  const { message } = App.useApp();
  const crud = useCrud(booksApi);
  const [form] = Form.useForm();
  
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);

  useEffect(() => {
    authorsApi.getAll({ limit: 1000 }).then(res => setAuthors(res.data.data)).catch(() => {});
    categoriesApi.getAll({ limit: 1000 }).then(res => setCategories(res.data.data)).catch(() => {});
    publishersApi.getAll({ limit: 1000 }).then(res => setPublishers(res.data.data)).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue(INIT);
    setOpen(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    form.setFieldsValue({
      ...r,
      author_ids: r.authors?.map(a => a.id) || [],
      category_ids: r.categories?.map(c => c.id) || [],
      image_url: r.images?.[0]?.image_url || r.image_url || ''
    });
    setOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await crud.update(editing.id, values);
        message.success('Cập nhật sách thành công');
      } else {
        await crud.create(values);
        message.success('Thêm sách mới thành công');
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
      title: 'Tên sách',
      dataIndex: 'title',
      width: 320,
      render: (title, rec) => (
        <Space align="start">
          {rec.images && rec.images.length > 0 && rec.images[0].image_url ? (
            <img src={rec.images[0].image_url} alt={title} style={{ width: 44, height: 56, objectFit: 'cover', borderRadius: 6, flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
          ) : rec.image_url ? (
            <img src={rec.image_url} alt={title} style={{ width: 44, height: 56, objectFit: 'cover', borderRadius: 6, flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
          ) : (
            <div style={{
              width: 44, height: 56, borderRadius: 6, flexShrink: 0,
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOutlined style={{ color: '#94a3b8', fontSize: 20 }} />
            </div>
          )}
          <div>
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4, whiteSpace: 'normal', lineHeight: 1.3 }}>{title}</Text>
            <Space split={<Divider type="vertical" style={{ margin: '0 4px' }} />} size={0} style={{ fontSize: 12 }}>
              <Text type="secondary">{getFormatLabel(rec.format)}</Text>
              <Text type="secondary"><BarcodeOutlined /> {rec.isbn || rec.barcode || 'N/A'}</Text>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: 'Giá bán',
      dataIndex: 'sale_price',
      width: 120,
      align: 'right',
      render: (v, rec) => (
        <div>
          <Text strong style={{ fontSize: 15, display: 'block' }}>₫ {fmt(v)}</Text>
          {Number(rec.original_price) > Number(v) && (
            <Text type="secondary" delete style={{ fontSize: 12 }}>₫ {fmt(rec.original_price)}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Kho / Vị trí',
      dataIndex: 'stock_qty',
      width: 120,
      align: 'center',
      render: (v, rec) => (
        <div>
          <Tag color={v > 10 ? '#059669' : v > 0 ? '#F59E0B' : '#EF4444'} style={{ borderRadius: 12, fontWeight: 600, border: 'none' }}>
            {v} cuốn
          </Tag>
          {rec.warehouse_location && <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}><InboxOutlined /> {rec.warehouse_location}</Text>}
        </div>
      ),
    },
    {
      title: 'Đã bán',
      dataIndex: 'sold_count',
      width: 90,
      align: 'center',
      render: (v) => <Text strong style={{ color: '#3B82F6' }}>{fmt(v)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      width: 100,
      align: 'center',
      render: (v) => (
        <Tag color={v ? '#059669' : 'default'} style={{ borderRadius: 4, textTransform: 'uppercase', fontSize: 11 }}>
          {v ? 'Đang bán' : 'Đã ẩn'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, rec) => (
        <Space size={8}>
          <Tooltip title="Chỉnh sửa chi tiết">
            <Button type="text" icon={<EditOutlined style={{ color: '#3B82F6' }} />} onClick={() => openEdit(rec)} />
          </Tooltip>
          <Popconfirm title="Xóa sách này?" okText="Xóa" okButtonProps={{ danger: true }} cancelText="Hủy" onConfirm={() => crud.remove(rec.id)}>
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
          <Title level={3} style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>Quản lý Ấn phẩm & Sách</Title>
          <Text type="secondary">Quản lý kho sách, giá bán, định dạng và thông tin chi tiết</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: '#059669', height: 40, borderRadius: 8, fontWeight: 600 }}>
          Thêm sách mới
        </Button>
      </div>

      <Card variant="outlined" style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} bodyStyle={{ padding: 20 }}>
        <div style={{ marginBottom: 20, display: 'flex', gap: 16 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#34D399' }} />}
            placeholder="Tìm kiếm theo tên sách, ISBN, barcode..."
            value={crud.search}
            onChange={(e) => crud.handleSearch(e.target.value)}
            style={{ width: 320, borderRadius: 8, height: 40 }}
            allowClear
          />
        </div>
        
        <Table
          dataSource={crud.data}
          columns={columns}
          rowKey="id"
          loading={crud.loading}
          size="middle"
          scroll={{ x: 900 }}
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
        title={<span style={{ fontFamily: "'Inter', sans-serif", fontSize: 20 }}>{editing ? 'Chỉnh sửa Thông tin Sách' : 'Thêm Sách Mới'}</span>}
        width={720}
        onClose={() => setOpen(false)}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={() => setOpen(false)} style={{ borderRadius: 6 }}>Hủy</Button>
            <Button onClick={handleOk} type="primary" loading={saving} style={{ background: '#059669', borderRadius: 6, fontWeight: 600 }}>
              {editing ? 'Lưu thay đổi' : 'Tạo sách'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          
          <Divider orientation="left" style={{ borderColor: '#34D399', color: '#059669' }}>Thông tin Cơ bản</Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Tên sách" name="title" rules={[{ required: true, message: 'Vui lòng nhập tên sách' }]}>
                <Input placeholder="Ví dụ: Nhà Giả Kim" size="large" onChange={(e) => form.setFieldsValue({ slug: generateSlug(e.target.value) })} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Đường dẫn (Slug)" name="slug" rules={[{ required: true, message: 'Slug không được để trống' }]}>
                <Input placeholder="nha-gia-kim" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Link Ảnh Bìa" name="image_url">
                <Input placeholder="https://..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Mã NXB" name="publisher_id">
                <Select
                  showSearch
                  placeholder="Chọn NXB"
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={publishers.map(p => ({ label: p.name, value: p.id }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Mã ISBN" name="isbn">
                <Input placeholder="ISBN-13" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Định dạng" name="format">
                <Select placeholder="Chọn định dạng">
                  <Select.Option value="soft_cover">Bìa mềm</Select.Option>
                  <Select.Option value="hard_cover">Bìa cứng</Select.Option>
                  <Select.Option value="ebook">Sách điện tử</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tác giả" name="author_ids">
                <Select
                  mode="multiple"
                  showSearch
                  placeholder="Chọn tác giả"
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={authors.map(a => ({ label: a.name, value: a.id }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Thể loại" name="category_ids">
                <Select
                  mode="multiple"
                  showSearch
                  placeholder="Chọn thể loại"
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={categories.map(c => ({ label: c.name, value: c.id }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: '#34D399', color: '#059669' }}>Giá bán & Kho</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Giá gốc (VNĐ)" name="original_price" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Giá bán (VNĐ)" name="sale_price" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Tồn kho" name="stock_qty" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Vị trí lưu kho" name="warehouse_location">
                <Input placeholder="Kệ A, Tầng 2" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Barcode" name="barcode">
                <Input placeholder="Mã vạch sản phẩm" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: '#34D399', color: '#059669' }}>Kích thước & Trọng lượng</Divider>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Trọng lượng (g)" name="weight_grams" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Dài (cm)" name="length_cm">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Rộng (cm)" name="width_cm">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Dày (cm)" name="height_cm">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: '#34D399', color: '#059669' }}>Mô tả chi tiết</Divider>
          <Form.Item name="description">
            <Input.TextArea rows={6} placeholder="Nhập tóm tắt nội dung sách..." style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="is_active" valuePropName="checked">
            <Switch checkedChildren="Hiển thị công khai" unCheckedChildren="Đang ẩn" />
          </Form.Item>

        </Form>
      </Drawer>
    </>
  );
}
