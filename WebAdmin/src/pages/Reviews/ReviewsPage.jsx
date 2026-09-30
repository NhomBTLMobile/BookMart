import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Drawer,
  Tag,
  Tooltip,
  Popconfirm,
  Typography,
  Rate,
  Row,
  Col,
  Divider,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  UserOutlined,
  BookOutlined
} from "@ant-design/icons";
import { App } from "antd";
import { useCrud } from "../../hooks/useCrud";
import { reviewsApi } from "../../api/services";
import { useAuth } from "../../context/AuthContext";

const { Text, Title, Paragraph } = Typography;

const ratingColor = (r) =>
  r >= 4 ? "#059669" : r === 3 ? "#faad14" : "#ff4d4f";

export default function ReviewsPage() {
  const { user, isDark } = useAuth();
  const { message } = App.useApp();
  const crud = useCrud(reviewsApi);
  const [viewRec, setViewRec] = useState(null);

  const columns = [
    {
      title: "Đánh giá",
      dataIndex: "rating",
      width: 170,
      render: (v) => (
        <Space size={10}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: ratingColor(v) + "15",
              border: `1px solid ${ratingColor(v)}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: ratingColor(v),
              fontSize: 15,
            }}
          >
            {v}
          </div>
          <Rate disabled value={v} style={{ fontSize: 13 }} />
        </Space>
      ),
    },
    {
      title: "Nhận xét",
      dataIndex: "body",
      ellipsis: true,
      render: (v) =>
        v ? (
          <Text>{v}</Text>
        ) : (
          <Text type="secondary" italic>
            Không có nhận xét
          </Text>
        ),
    },
    {
      title: "Xác thực",
      dataIndex: "is_verified",
      width: 130,
      align: "center",
      render: (v) => (
        v ? (
          <Tag icon={<CheckCircleOutlined />} color="#059669" style={{ borderRadius: 12 }}>Đã mua hàng</Tag>
        ) : (
          <Tag color="default" style={{ borderRadius: 12 }}>Chưa xác thực</Tag>
        )
      ),
    },
    {
      title: "Ngày đánh giá",
      dataIndex: "created_at",
      width: 130,
      render: (v) => (
        <Text type="secondary">{v ? new Date(v).toLocaleDateString("vi-VN") : '—'}</Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      align: 'center',
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#059669' }} />}
              onClick={() => setViewRec(rec)}
            />
          </Tooltip>
          {user?.role === "ADMIN" && (
            <Popconfirm
              title="Xóa đánh giá này?"
              okText="Xóa"
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
            Quản lý Đánh giá
          </Title>
          <Text type="secondary">
            Kiểm duyệt bình luận và đánh giá của khách hàng
          </Text>
        </div>
      </div>

      <Card variant="outlined" style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} styles={{ body: { padding: 20 } }}>
        <div style={{ marginBottom: 20, display: 'flex', gap: 16 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm theo nội dung đánh giá..."
            value={crud.search}
            onChange={(e) => crud.handleSearch(e.target.value)}
            style={{ width: 320, borderRadius: 8, height: 40 }}
            allowClear
          />
        </div>
        <Table scroll={{ x: 800 }}
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
        title={<span style={{ fontFamily: "'Inter', sans-serif", fontSize: 20 }}>Chi tiết Đánh giá</span>}
        width={500}
        onClose={() => setViewRec(null)}
        open={!!viewRec}
        styles={{ body: { paddingBottom: 80, background: isDark ? '#18181B' : '#F9FAFB' } }}
      >
        {viewRec && (
          <div>
            <Card variant="outlined" style={{ borderRadius: 12, marginBottom: 16, background: isDark ? '#27272A' : '#ffffff', border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}` }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: ratingColor(viewRec.rating) + "18",
                    border: `1px solid ${ratingColor(viewRec.rating)}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 32,
                    color: ratingColor(viewRec.rating),
                    margin: '0 auto 12px'
                  }}
                >
                  {viewRec.rating}
                </div>
                <Rate disabled value={viewRec.rating} style={{ fontSize: 20 }} />
                <div style={{ marginTop: 8 }}>
                  {viewRec.is_verified ? (
                    <Tag icon={<CheckCircleOutlined />} color="#059669" style={{ borderRadius: 12 }}>Đã mua hàng</Tag>
                  ) : (
                    <Tag color="default" style={{ borderRadius: 12 }}>Chưa xác thực mua hàng</Tag>
                  )}
                </div>
              </div>
              
              <Divider style={{ margin: '16px 0', borderColor: isDark ? '#3F3F46' : '#E5E7EB' }} />
              
              <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                Nội dung nhận xét
              </Text>
              <div style={{ background: isDark ? '#18181B' : '#F3F4F6', padding: 16, borderRadius: 8 }}>
                {viewRec.body ? (
                  <Paragraph style={{ margin: 0, fontSize: 15 }}>{viewRec.body}</Paragraph>
                ) : (
                  <Text type="secondary" italic>
                    Khách hàng không để lại nội dung nhận xét.
                  </Text>
                )}
              </div>
            </Card>

            <Card variant="outlined" title={<span style={{ color: '#059669' }}>Thông tin tham chiếu</span>} size="small" style={{ borderRadius: 12, background: isDark ? '#27272A' : '#ffffff', border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}` }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <UserOutlined style={{ color: '#94a3b8', marginTop: 4 }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Người dùng</Text>
                    {viewRec.user_name ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        {viewRec.user_avatar_url ? (
                          <img src={viewRec.user_avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold' }}>
                            {viewRec.user_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <Text strong style={{ fontSize: 13, display: 'block' }}>{viewRec.user_name}</Text>
                          {viewRec.user_email && <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{viewRec.user_email}</Text>}
                        </div>
                      </div>
                    ) : (
                      <Text code>{viewRec.user_id || 'N/A'}</Text>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <BookOutlined style={{ color: '#94a3b8', marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Sản phẩm</Text>
                    {viewRec.book_title ? (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 4 }}>
                        {viewRec.book_image_url ? (
                          <img src={viewRec.book_image_url} alt="" style={{ width: 32, height: 44, borderRadius: 4, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 32, height: 44, borderRadius: 4, background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOutlined style={{ color: '#9CA3AF' }} />
                          </div>
                        )}
                        <Text strong style={{ fontSize: 13, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {viewRec.book_title}
                        </Text>
                      </div>
                    ) : (
                      <Text code>{viewRec.book_id || 'N/A'}</Text>
                    )}
                  </div>
                </div>
                {viewRec.order_item_id && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <CheckCircleOutlined style={{ color: '#94a3b8', marginTop: 4 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Mã tham chiếu đơn hàng</Text>
                      <Text code>{viewRec.order_item_id}</Text>
                    </div>
                  </div>
                )}
              </Space>
            </Card>
          </div>
        )}
      </Drawer>
    </>
  );
}
