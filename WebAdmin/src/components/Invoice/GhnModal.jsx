import React, { useState } from 'react';
import { Modal, Form, Row, Col, InputNumber, Typography, App } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { ordersApi } from '../../api/services';

export default function GhnModal({ open, onClose, orderId, onSuccess }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      const vals = await form.validateFields();
      setLoading(true);
      await ordersApi.createGHN(orderId, vals);
      message.success("Tạo vận đơn GHN thành công!");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      message.error(err?.response?.data?.message || "Lỗi tạo vận đơn GHN");
    } finally {
      setLoading(false);
    }
  };

  // Set default values when opening
  React.useEffect(() => {
    if (open) {
      form.setFieldsValue({ weight: 500, length: 20, width: 20, height: 10 });
    }
  }, [open, form]);

  return (
    <Modal
      title={<span><SendOutlined style={{ color: '#f59e0b', marginRight: 8 }} />Tạo đơn Giao Hàng Nhanh (GHN)</span>}
      open={open}
      onCancel={onClose}
      onOk={handleCreate}
      confirmLoading={loading}
      okText="Gửi lên GHN"
      cancelText="Hủy"
      okButtonProps={{ style: { background: '#f59e0b', borderColor: '#f59e0b' } }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Trọng lượng (gram)" name="weight" rules={[{ required: true, message: 'Nhập trọng lượng' }]}>
              <InputNumber style={{ width: '100%' }} min={10} max={30000} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Chiều dài (cm)" name="length" rules={[{ required: true, message: 'Nhập chiều dài' }]}>
              <InputNumber style={{ width: '100%' }} min={1} max={200} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Chiều rộng (cm)" name="width" rules={[{ required: true, message: 'Nhập chiều rộng' }]}>
              <InputNumber style={{ width: '100%' }} min={1} max={200} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Chiều cao (cm)" name="height" rules={[{ required: true, message: 'Nhập chiều cao' }]}>
              <InputNumber style={{ width: '100%' }} min={1} max={200} />
            </Form.Item>
          </Col>
        </Row>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          * Thông tin kích thước sẽ được gửi qua API của GHN để tạo vận đơn chính thức. 
          Sau khi tạo, đơn sẽ chuyển sang trạng thái <strong>Đang đóng gói</strong>.
        </Typography.Text>
      </Form>
    </Modal>
  );
}
