import { useState } from 'react'
import { Card, Table, Button, Input, Space, Modal, Tag, Tooltip, Popconfirm, Typography, Rate } from 'antd'
import { DeleteOutlined, SearchOutlined, EyeOutlined, MessageOutlined } from '@ant-design/icons'
import { App } from 'antd'
import { useCrud } from '../../hooks/useCrud'
import { reviewsApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'

const { Text, Paragraph } = Typography

const ratingColor = r => r >= 4 ? '#52c41a' : r === 3 ? '#faad14' : '#ff4d4f'

export default function ReviewsPage() {
  const { user } = useAuth()
  const crud = useCrud(reviewsApi)
  const [viewRec, setViewRec] = useState(null)

  const columns = [
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      width: 160,
      render: v => (
        <Space>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: ratingColor(v) + '18',
            border: `1px solid ${ratingColor(v)}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: ratingColor(v), fontSize: 14,
          }}>
            {v}
          </div>
          <Rate disabled value={v} style={{ fontSize: 13 }} />
        </Space>
      ),
    },
    {
      title: 'Nhận xét',
      dataIndex: 'comment',
      ellipsis: true,
      render: v => v
        ? <Text type="secondary">{v}</Text>
        : <Text type="secondary" italic>Không có nhận xét</Text>,
    },
    {
      title: 'Người dùng',
      dataIndex: 'user_id',
      width: 130,
      render: v => <Text code style={{ fontSize: 12 }}>{v?.slice(-8).toUpperCase()}</Text>,
    },
    {
      title: 'Ngày đánh giá',
      dataIndex: 'created_at',
      width: 130,
      render: v => <Text type="secondary">{new Date(v).toLocaleDateString('vi-VN')}</Text>,
    },
    {
      key: 'actions', width: 90,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" onClick={() => setViewRec(rec)} />
          </Tooltip>
          {user?.role === 'ADMIN' && (
            <Popconfirm title="Xóa đánh giá này?" okText="Xóa" okButtonProps={{ danger: true }} cancelText="Hủy" onConfirm={() => crud.remove(rec.id)}>
              <Tooltip title="Xóa">
                <Button icon={<DeleteOutlined />} size="small" danger />
              </Tooltip>
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
          <Typography.Title level={4} style={{ margin: 0 }}>Đánh giá</Typography.Title>
          <Text type="secondary">Quản lý và kiểm duyệt đánh giá của khách hàng</Text>
        </div>
      </div>

      <Card variant="outlined" style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined />} placeholder="Tìm đánh giá..." value={crud.search}
            onChange={e => crud.handleSearch(e.target.value)} style={{ width: 280 }} allowClear />
        </div>
        <Table dataSource={crud.data} columns={columns} rowKey="id" loading={crud.loading} size="middle"
          pagination={{ current: crud.page, pageSize: 10, total: crud.meta?.total, onChange: crud.setPage, showSizeChanger: false, showTotal: (t,r) => `${r[0]}–${r[1]} / ${t}` }} />
      </Card>

      <Modal open={!!viewRec} title="Chi tiết đánh giá" footer={null} onCancel={() => setViewRec(null)} width={480}>
        {viewRec && (
          <Space direction="vertical" size={16} style={{ width: '100%', marginTop: 16 }}>
            <Space>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: ratingColor(viewRec.rating) + '18',
                border: `1px solid ${ratingColor(viewRec.rating)}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 18, color: ratingColor(viewRec.rating),
              }}>
                {viewRec.rating}
              </div>
              <Rate disabled value={viewRec.rating} />
              <Text type="secondary">/ 5 sao</Text>
            </Space>

            <div>
              <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nhận xét</Text>
              <Card size="small" style={{ marginTop: 6 }}>
                {viewRec.comment
                  ? <Paragraph style={{ margin: 0 }}>{viewRec.comment}</Paragraph>
                  : <Text type="secondary" italic>Không có nhận xét</Text>
                }
              </Card>
            </div>

            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <strong>ID Người dùng:</strong> <Text code>{viewRec.user_id}</Text>
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <strong>ID Sách:</strong> <Text code>{viewRec.book_id}</Text>
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <strong>Ngày đánh giá:</strong> {new Date(viewRec.created_at).toLocaleString('vi-VN')}
              </Text>
            </Space>
          </Space>
        )}
      </Modal>
    </>
  )
}
