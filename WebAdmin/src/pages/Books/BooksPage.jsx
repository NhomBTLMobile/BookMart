import { useState } from 'react'
import {
  Card, Table, Button, Input, Space, Modal, Form,
  InputNumber, Tag, Switch, Tooltip, Popconfirm, Typography, Image,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, BookOutlined } from '@ant-design/icons'
import { App } from 'antd'
import { useCrud } from '../../hooks/useCrud'
import { booksApi } from '../../api/services'

const { Text, Paragraph } = Typography
const fmt = n => new Intl.NumberFormat('vi-VN').format(n)

const INIT = { title: '', publisher: '', publish_year: new Date().getFullYear(), description: '', price: null, stock: 0, is_active: true }

export default function BooksPage() {
  const { message } = App.useApp()
  const crud = useCrud(booksApi)
  const [form] = Form.useForm()
  const [open, setOpen]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)

  const openCreate = () => { setEditing(null); form.setFieldsValue(INIT); setOpen(true) }
  const openEdit   = r  => { setEditing(r);   form.setFieldsValue({ ...r }); setOpen(true) }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      if (editing) await crud.update(editing.id, values)
      else         await crud.create(values)
      setOpen(false)
    } catch (err) {
      if (err?.response) message.error(err.response.data?.message || 'Lỗi')
    } finally { setSaving(false) }
  }

  const columns = [
    {
      title: 'Sách',
      dataIndex: 'title',
      render: (title) => (
        <Space>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg,#52c41a22,#237804aa)',
            border: '1px solid rgba(82,196,26,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOutlined style={{ color: '#52c41a' }} />
          </div>
          <Text strong style={{ fontSize: 13.5 }}>{title}</Text>
        </Space>
      ),
    },
    { title: 'NXB', dataIndex: 'publisher', render: v => v || <Text type="secondary">—</Text> },
    { title: 'Năm', dataIndex: 'publish_year', width: 70, render: v => v || '—' },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      render: v => <Text strong style={{ color: '#52c41a' }}>₫ {fmt(v)}</Text>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      render: v => (
        <Tag color={v > 10 ? 'success' : v > 0 ? 'warning' : 'error'}>{v}</Tag>
      ),
    },
    {
      title: 'Hiển thị',
      dataIndex: 'is_active',
      render: v => <Tag color={v ? 'success' : 'default'}>{v ? 'Đang bán' : 'Ẩn'}</Tag>,
    },
    {
      key: 'actions', width: 90,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(rec)} />
          </Tooltip>
          <Popconfirm title="Xóa sách này?" okText="Xóa" okButtonProps={{ danger: true }} cancelText="Hủy" onConfirm={() => crud.remove(rec.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div className="page-header-row">
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>Quản lý Sách</Typography.Title>
          <Text type="secondary">Danh sách sách trong hệ thống</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} id="create-book-btn">
          Thêm sách
        </Button>
      </div>

      <Card variant="outlined" style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="Tìm theo tên sách, NXB..." value={crud.search}
            onChange={e => crud.handleSearch(e.target.value)} style={{ width: 280 }} allowClear />
        </div>
        <Table
          dataSource={crud.data} columns={columns} rowKey="id"
          loading={crud.loading} size="middle"
          pagination={{ current: crud.page, pageSize: 10, total: crud.meta?.total, onChange: crud.setPage, showSizeChanger: false, showTotal: (t, r) => `${r[0]}–${r[1]} / ${t}` }}
        />
      </Card>

      <Modal open={open} title={editing ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
        onOk={handleOk} onCancel={() => setOpen(false)}
        okText={editing ? 'Lưu' : 'Tạo'} cancelText="Hủy"
        confirmLoading={saving} width={600} destroyOnHide
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Tên sách" name="title" rules={[{ required: true, message: 'Vui lòng nhập tên sách' }]}>
            <Input placeholder="Nhập tên sách..." />
          </Form.Item>
          <Space style={{ width: '100%' }} size={12}>
            <Form.Item label="Nhà xuất bản" name="publisher" style={{ flex: 1, marginBottom: 0 }}>
              <Input placeholder="NXB Kim Đồng..." />
            </Form.Item>
            <Form.Item label="Năm xuất bản" name="publish_year" style={{ width: 140, marginBottom: 0 }}>
              <InputNumber style={{ width: '100%' }} placeholder="2024" min={1900} max={2100} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%', marginTop: 16 }} size={12}>
            <Form.Item label="Giá bán (VNĐ)" name="price" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 0 }}>
              <InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="150,000" />
            </Form.Item>
            <Form.Item label="Số lượng tồn" name="stock" style={{ width: 140, marginBottom: 0 }}>
              <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
            </Form.Item>
          </Space>
          <Form.Item label="Mô tả" name="description" style={{ marginTop: 16 }}>
            <Input.TextArea rows={3} placeholder="Mô tả nội dung sách..." />
          </Form.Item>
          <Form.Item label="Hiển thị trên App" name="is_active" valuePropName="checked">
            <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
