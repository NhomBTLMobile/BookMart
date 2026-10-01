import { useRef } from 'react';
import { Modal, Button, Row, Col, Card, Typography, Tag, Divider } from 'antd';
import { PrinterOutlined, GlobalOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const fmt = n => new Intl.NumberFormat('vi-VN').format(Number(n) || 0);

export default function InvoiceModal({ open, onClose, order }) {
  const { isDark } = useAuth();
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  let addressInfo = null;
  if (order?.shipping_snapshot) {
    try {
      addressInfo = typeof order.shipping_snapshot === 'string'
        ? JSON.parse(order.shipping_snapshot)
        : order.shipping_snapshot;
    } catch {
      addressInfo = null;
    }
  }

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Đóng
          </Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint} style={{ backgroundColor: '#059669' }}>
            In Hóa Đơn
          </Button>,
        ]}
        width={720}
        destroyOnHidden
        style={{ top: 20 }}
      >
        {order && (
          <div ref={printRef} className="printable-invoice" style={{ padding: '10px 10px' }}>
            {/* Header Website */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src="/bookmart_logo.png" alt="BookMart" style={{ height: 40 }} />
                  <Title level={3} style={{ margin: 0, color: '#059669', fontFamily: "'Inter', sans-serif" }}>BookMart</Title>
                </div>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
                  <GlobalOutlined /> Website: <strong>bookmart.vn</strong> | <PhoneOutlined /> Hotline: 1900 8888
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <MailOutlined /> Email: cskh@bookmart.vn | Hóa Đơn Bán Hàng Trực Tuyến
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Title level={4} style={{ margin: 0, color: isDark ? '#e5e7eb' : '#333' }}>HÓA ĐƠN BÁN HÀNG</Title>
                <Text code style={{ fontSize: 14, color: '#059669', fontWeight: 700 }}>#{order.order_code}</Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Ngày lập: {new Date(order.created_at).toLocaleDateString('vi-VN')} {new Date(order.created_at).toLocaleTimeString('vi-VN')}
                  </Text>
                </div>
              </div>
            </div>

            {/* Thông tin khách hàng & Giao hàng */}
            <Card size="small" style={{ borderRadius: 8, marginBottom: 20, background: isDark ? '#27272A' : '#f8fafc', borderColor: isDark ? '#3F3F46' : '#e2e8f0' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>KHÁCH HÀNG:</Text>
                  <Text strong style={{ fontSize: 15, color: isDark ? '#e5e7eb' : '#0f172a' }}>{order.customer_name || 'Khách vãng lai'}</Text>
                  {order.customer_email && <div style={{ fontSize: 13 }}>Email: {order.customer_email}</div>}
                  {order.customer_phone && <div style={{ fontSize: 13 }}>SĐT: <strong>{order.customer_phone}</strong></div>}
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>ĐỊA CHỈ GIAO HÀNG:</Text>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    <HomeOutlined style={{ marginRight: 4, color: '#059669' }} />
                    {addressInfo?.full_address || 
                      [addressInfo?.street_address, addressInfo?.ward_name, addressInfo?.district_name, addressInfo?.province_name]
                        .filter(Boolean).join(', ') || 
                      'Địa chỉ đăng ký trên hệ thống'}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Hình thức thanh toán: </Text>
                    <Tag color={order.payment_method === 'vnpay' ? 'purple' : 'blue'} style={{ fontWeight: 600 }}>
                      {order.payment_method === 'vnpay' ? 'Thanh toán VNPAY' : 'Thanh toán COD'}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Bảng danh sách sản phẩm */}
            <Title level={5} style={{ marginBottom: 10, color: isDark ? '#e5e7eb' : '#0f172a' }}>Chi tiết danh sách sách đặt mua</Title>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13, color: isDark ? '#e5e7eb' : '#0f172a' }}>
              <thead>
                <tr style={{ background: isDark ? '#262626' : '#f1f5f9', borderBottom: `2px solid ${isDark ? '#434343' : '#e2e8f0'}`, textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', width: 50, textAlign: 'center' }}>STT</th>
                  <th style={{ padding: '8px 12px' }}>Tên sách</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', width: 120 }}>Đơn giá</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', width: 80 }}>Số lượng</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', width: 130 }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${isDark ? '#3F3F46' : '#e2e8f0'}` }}>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: isDark ? '#a6a6a6' : '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.item_name}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>₫ {fmt(item.unit_price)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>₫ {fmt(item.total_price)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#8c8c8c' }}>
                      Sản phẩm trong đơn hàng #{order.order_code}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Bảng tổng tiền & thanh toán */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <div style={{ width: 280 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                  <Text type="secondary">Tạm tính tiền hàng:</Text>
                  <Text strong>₫ {fmt(order.subtotal || order.total_amount)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                  <Text type="secondary">Phí vận chuyển:</Text>
                  <Text>₫ {fmt(order.shipping_fee || 30000)}</Text>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, color: '#ff4d4f' }}>
                    <Text type="secondary" style={{ color: '#ff4d4f' }}>Giảm giá (Voucher):</Text>
                    <Text strong style={{ color: '#ff4d4f' }}>- ₫ {fmt(order.discount_amount)}</Text>
                  </div>
                )}
                <Divider style={{ margin: '8px 0', borderColor: isDark ? '#434343' : 'rgba(0,0,0,0.06)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 16 }}>
                  <Text strong style={{ color: isDark ? '#e5e7eb' : '#0f172a' }}>TỔNG THANH TOÁN:</Text>
                  <Text strong style={{ color: '#059669', fontSize: 18 }}>₫ {fmt(order.total_amount)}</Text>
                </div>
              </div>
            </div>

            {/* Chân trang hóa đơn */}
            <div style={{ marginTop: 30, paddingTop: 16, borderTop: `1px dashed ${isDark ? '#434343' : '#d9d9d9'}`, textTransform: 'center', textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic', display: 'block' }}>
                Cảm ơn Quý khách đã mua sắm tại BookMart.vn!
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Mọi thắc mắc vui lòng liên hệ Hotline 1900 8888 để được hỗ trợ giải đáp.
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* CSS @media print */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-invoice, .printable-invoice * { visibility: visible; }
          .printable-invoice {
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 20px !important; background: #fff !important; color: #000 !important;
          }
          .ant-modal-footer, .ant-modal-close { display: none !important; }
        }
      `}</style>
    </>
  );
}
