import { useState } from 'react'
import { Card, Table, Button, Input, Space, Modal, Form, Tag, Avatar, Tooltip, Popconfirm, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { App } from 'antd'
import { useCrud } from '../../hooks/useCrud'
import { authorsApi } from '../../api/services'

const { Text } = Typography
const INIT = { name: '', bio: '', avatar_url: '' }
const initials = name => name?.trim().split(' ').slice(-2).map(w => w[0]).join('').toUpperCase() || '?'

export default function AuthorsPage() {
  const { message } = App.useApp()
  const crud = useCrud(authorsApi)
  const [form] = Form.useForm()
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)

  const openCreate = () => { setEditing(null); form.setFieldsValue(INIT); setOpen(true) }
  const openEdit   = r  => { setEditing(r); form.setFieldsValue({ name: r.name, bio: r.bio || '', avatar_url: r.avatar_url || '' }); setOpen(true) }

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
      title: 'Tác giả',
      dataIndex: 'name',
      render: (name, rec) => (
        <Space>
          {rec.avatar_url
            ? <Avatar src={rec.avatar_url} size={36} />
            : <Avatar size={36} style={{ background: 'linear-gradient(135deg,#06b6d4,#1677ff)', fontWeight: 700 }}>{initials(name)}</Avatar>
          }
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Tiểu sử',
      dataIndex: 'bio',
      ellipsis: true,
      render: v => v ? <Text type="secondary">{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Ngày thêm',
      dataIndex: 'created_at',
      width: 130,
      render: v => <Text type="secondary">{new Date(v).toLocaleDateString('vi-VN')}</Text>,
    },
    {
      key: 'actions', width: 90,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa"><Button icon={<EditOutlined />} size="small" onClick={() => openEdit(rec)} /></Tooltip>
          <Popconfirm title="Xóa tác giả này?" okText="Xóa" okButtonProps={{ danger: true }} cancelText="Hủy" onConfirm={() => crud.remove(rec.id)}>
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
          <Typography.Title level={4} style={{ margin: 0 }}>Tác giả</Typography.Title>
          <Text type="secondary">Quản lý danh sách tác giả</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} id="create-author-btn">Thêm tác giả</Button>
      </div>

      <Card variant="outlined" style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="Tìm tác giả..." value={crud.search}
            onChange={e => crud.handleSearch(e.target.value)} style={{ width: 280 }} allowClear />
        </div>
        <Table dataSource={crud.data} columns={columns} rowKey="id" loading={crud.loading} size="middle"
          pagination={{ current: crud.page, pageSize: 10, total: crud.meta?.total, onChange: crud.setPage, showSizeChanger: false, showTotal: (t,r) => `${r[0]}–${r[1]} / ${t}` }} />
      </Card>

      <Modal open={open} title={editing ? 'Chỉnh sửa tác giả' : 'Thêm tác giả'} onOk={handleOk} onCancel={() => setOpen(false)}
        okText={editing ? 'Lưu' : 'Tạo'} cancelText="Hủy" confirmLoading={saving} destroyOnHide>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Tên tác giả" name="name" rules={[{ required: true }]}>
            <Input placeholder="Nguyễn Nhật Ánh..." />
          </Form.Item>
          <Form.Item label="Avatar URL" name="avatar_url">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item label="Tiểu sử" name="bio">
            <Input.TextArea rows={3} placeholder="Mô tả về tác giả..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
