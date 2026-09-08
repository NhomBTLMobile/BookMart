import { useState } from 'react'
import { Card, Table, Button, Input, Space, Modal, Form, Select, Tag, Tooltip, Popconfirm, Typography, Descriptions } from 'antd'
import { EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { App } from 'antd'
import { useCrud } from '../../hooks/useCrud'
import { ordersApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'

const { Text } = Typography
const fmt = n => new Intl.NumberFormat('vi-VN').format(n)

const ORDER_STATUS_OPTIONS = [
  { label: 'Chờ xử lý',     value: 'PENDING',   color: 'gold'    },
  { label: 'Đang chuẩn bị', value: 'PREPARING', color: 'blue'    },
  { label: 'Đang giao',     value: 'SHIPPING',  color: 'cyan'    },
  { label: 'Hoàn thành',    value: 'COMPLETED', color: 'success' },
  { label: 'Đã hủy',        value: 'CANCELLED', color: 'error'   },
]

const PAYMENT_STATUS = {
  UNPAID:   { label: 'Chưa thanh toán', color: 'warning' },
  PAID:     { label: 'Đã thanh toán',   color: 'success' },
  REFUNDED: { label: 'Hoàn tiền',       color: 'purple'  },
}

const statusColor = v => ORDER_STATUS_OPTIONS.find(o => o.value === v)?.color || 'default'
const statusLabel = v => ORDER_STATUS_OPTIONS.find(o => o.value === v)?.label || v

export default function OrdersPage() {
  const { user } = useAuth()
  const { message } = App.useApp()
  const crud = useCrud(ordersApi)
  const [editForm] = Form.useForm()
  const [viewRec, setViewRec]   = useState(null)
  const [editRec, setEditRec]   = useState(null)
  const [saving, setSaving]     = useState(false)

  const openEdit = rec => {
    setEditRec(rec)
    editForm.setFieldsValue({ order_status: rec.order_status })
  }

  const handleSave = async () => {
    const values = await editForm.validateFields()
    setSaving(true)
    try {
      await crud.update(editRec.id, values)
      setEditRec(null)
    } catch (err) {
      message.error(err.response?.data?.message || 'Lỗi cập nhật')
    } finally { setSaving(false) }
  }

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      width: 110,
      render: v => <Text code style={{ fontSize: 12 }}>#{v?.slice(-8).toUpperCase()}</Text>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'final_price',
      render: v => <Text strong style={{ color: '#689f38' }}>₫ {fmt(v || 0)}</Text>,
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount_price',
      render: v => v > 0
        ? <Text type="secondary">-₫ {fmt(v)}</Text>
        : <Text type="secondary">—</Text>,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'payment_method',
      render: v => <Tag color={v === 'VNPAY' ? 'purple' : 'default'}>{v}</Tag>,
    },
    {
      title: 'TT Thanh toán',
      dataIndex: 'payment_status',
      render: v => {
        const s = PAYMENT_STATUS[v] || { label: v, color: 'default' }
        return <Tag color={s.color}>{s.label}</Tag>
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'order_status',
      render: v => <Tag color={statusColor(v)}>{statusLabel(v)}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      render: v => <Text type="secondary">{new Date(v).toLocaleDateString('vi-VN')}</Text>,
    },
    {
      key: 'actions', width: 120,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" onClick={() => setViewRec(rec)} />
          </Tooltip>
          <Tooltip title="Cập nhật trạng thái">
            <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(rec)} />
          </Tooltip>
          {user?.role === 'ADMIN' && (
            <Popconfirm title="Xóa đơn hàng này?" okText="Xóa" okButtonProps={{ danger: true }} cancelText="Hủy" onConfirm={() => crud.remove(rec.id)}>
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <div className="page-header-row">
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>Đơn hàng</Typography.Title>
          <Text type="secondary">Quản lý và theo dõi đơn hàng khách hàng</Text>
        </div>
      </div>

      <Card variant="outlined" style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="Tìm đơn hàng..." value={crud.search}
            onChange={e => crud.handleSearch(e.target.value)} style={{ width: 280 }} allowClear />
        </div>
        <Table dataSource={crud.data} columns={columns} rowKey="id" loading={crud.loading} size="middle"
          pagination={{ current: crud.page, pageSize: 10, total: crud.meta?.total, onChange: crud.setPage, showSizeChanger: false, showTotal: (t,r) => `${r[0]}–${r[1]} / ${t}` }} />
      </Card>

      {/* View Detail */}
      <Modal open={!!viewRec} title="Chi tiết đơn hàng" footer={null} onCancel={() => setViewRec(null)} width={560}>
        {viewRec && (
          <Descriptions column={2} size="small" bordered style={{ marginTop: 16 }}>
            <Descriptions.Item label="Mã đơn" span={2}>
              <Text code>#{viewRec.id?.toUpperCase()}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền hàng">
              <Text strong>₫ {fmt(viewRec.total_price || 0)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Giảm giá">
              <Text style={{ color: '#689f38' }}>{viewRec.discount_price > 0 ? `-₫ ${fmt(viewRec.discount_price)}` : '₫ 0'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thành tiền" span={2}>
              <Text strong style={{ fontSize: 16, color: '#689f38' }}>₫ {fmt(viewRec.final_price || 0)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức TT">
              <Tag color={viewRec.payment_method === 'VNPAY' ? 'purple' : 'default'}>{viewRec.payment_method}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="TT Thanh toán">
              <Tag color={PAYMENT_STATUS[viewRec.payment_status]?.color}>{PAYMENT_STATUS[viewRec.payment_status]?.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="TT Đơn hàng" span={2}>
              <Tag color={statusColor(viewRec.order_status)}>{statusLabel(viewRec.order_status)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt" span={2}>
              {new Date(viewRec.created_at).toLocaleString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Edit Status */}
      <Modal open={!!editRec} title="Cập nhật trạng thái đơn" onOk={handleSave} onCancel={() => setEditRec(null)}
        okText="Lưu" cancelText="Hủy" confirmLoading={saving} destroyOnHide>
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Trạng thái đơn hàng" name="order_status" rules={[{ required: true }]}>
            <Select options={ORDER_STATUS_OPTIONS.map(o => ({ label: <Tag color={o.color}>{o.label}</Tag>, value: o.value }))} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
