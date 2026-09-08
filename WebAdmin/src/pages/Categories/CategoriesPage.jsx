import { useState } from 'react'
import { Card, Table, Button, Input, Space, Modal, Form, Tag, Tooltip, Popconfirm, Typography, ColorPicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, TagOutlined } from '@ant-design/icons'
import { App } from 'antd'
import { useCrud } from '../../hooks/useCrud'
import { categoriesApi } from '../../api/services'

const { Text } = Typography
const INIT = { name: '', description: '' }

const PALETTE = ['#689f38','#1677ff','#722ed1','#fa8c16','#f5222d','#13c2c2','#eb2f96','#2f54eb']
const catColor = name => PALETTE[(name?.charCodeAt(0) || 0) % PALETTE.length]

export default function CategoriesPage() {
  const { message } = App.useApp()
  const crud = useCrud(categoriesApi)
  const [form] = Form.useForm()
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)

  const openCreate = () => { setEditing(null); form.setFieldsValue(INIT); setOpen(true) }
  const openEdit   = r  => { setEditing(r); form.setFieldsValue({ name: r.name, description: r.description || '' }); setOpen(true) }

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
      title: 'Thể loại',
      dataIndex: 'name',
      render: (name) => (
        <Space>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: catColor(name) + '1a',
            border: `1px solid ${catColor(name)}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TagOutlined style={{ color: catColor(name), fontSize: 14 }} />
          </div>
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      ellipsis: true,
      render: v => v ? <Text type="secondary">{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      width: 130,
      render: v => <Text type="secondary">{new Date(v).toLocaleDateString('vi-VN')}</Text>,
    },
    {
      key: 'actions', width: 90,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa"><Button icon={<EditOutlined />} size="small" onClick={() => openEdit(rec)} /></Tooltip>
          <Popconfirm title="Xóa thể loại này?" okText="Xóa" okButtonProps={{ danger: true }} cancelText="Hủy" onConfirm={() => crud.remove(rec.id)}>
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
          <Typography.Title level={4} style={{ margin: 0 }}>Thể loại</Typography.Title>
          <Text type="secondary">Quản lý thể loại sách</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} id="create-category-btn">Thêm thể loại</Button>
      </div>

      <Card variant="outlined" style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="Tìm thể loại..." value={crud.search}
            onChange={e => crud.handleSearch(e.target.value)} style={{ width: 280 }} allowClear />
        </div>
        <Table dataSource={crud.data} columns={columns} rowKey="id" loading={crud.loading} size="middle"
          pagination={{ current: crud.page, pageSize: 10, total: crud.meta?.total, onChange: crud.setPage, showSizeChanger: false, showTotal: (t,r) => `${r[0]}–${r[1]} / ${t}` }} />
      </Card>

      <Modal open={open} title={editing ? 'Chỉnh sửa thể loại' : 'Thêm thể loại'} onOk={handleOk} onCancel={() => setOpen(false)}
        okText={editing ? 'Lưu' : 'Tạo'} cancelText="Hủy" confirmLoading={saving} destroyOnHide>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Tên thể loại" name="name" rules={[{ required: true }]}>
            <Input placeholder="Văn học, Khoa học..." />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả thể loại..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
