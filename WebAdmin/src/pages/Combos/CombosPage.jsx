import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Drawer,
  Form,
  Tag,
  Tooltip,
  Popconfirm,
  Typography,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Switch,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import { App } from "antd";
import dayjs from "dayjs";
import { useCrud } from "../../hooks/useCrud";
import { combosApi, booksApi } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

const { Text, Title } = Typography;
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n || 0);

const INIT = {
  name: "",
  cover_image_url: "",
  original_total: 0,
  combo_price: 0,
  stock_qty: 0,
  ends_at: null,
  is_active: true,
  books: [],
};

const comboStatus = (v) => {
  if (!v.is_active) return { label: "Tạm ẩn", color: "default" };
  const now = new Date();
  if (v.ends_at && new Date(v.ends_at) < now) return { label: "Hết hạn", color: "error" };
  if (v.stock_qty <= 0) return { label: "Hết hàng", color: "warning" };
  return { label: "Đang bán", color: "#059669" };
};

export default function CombosPage() {
  const { isDark, user: currentUser } = useAuth();
  const { message } = App.useApp();
  const crud = useCrud(combosApi);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [booksList, setBooksList] = useState([]);

  // Watch the dynamic 'books' array in the form
  const selectedBooks = Form.useWatch('books', form);

  // Auto calculate original_total whenever books change
  useEffect(() => {
    if (selectedBooks && booksList.length > 0) {
      let total = 0;
      selectedBooks.forEach(b => {
        if (b && b.book_id && b.quantity) {
          const bookInfo = booksList.find(x => x.id === b.book_id);
          if (bookInfo) {
            // Dùng sale_price để tính tổng giá trị thực tế của các sách
            total += (Number(bookInfo.sale_price) || 0) * Number(b.quantity);
          }
        }
      });
      form.setFieldsValue({ original_total: total });
    }
  }, [selectedBooks, booksList, form]);

  useEffect(() => {
    booksApi.getAll({ limit: 1000 }).then(res => setBooksList(res.data.data)).catch(console.error);
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue(INIT);
    setOpen(true);
  };

  const openEdit = async (rec) => {
    // Open drawer immediately with basic data
    setEditing(rec);
    form.setFieldsValue({
      name: rec.name,
      cover_image_url: rec.cover_image_url,
      original_total: rec.original_total,
      combo_price: rec.combo_price,
      stock_qty: rec.stock_qty,
      ends_at: rec.ends_at ? dayjs(rec.ends_at) : null,
      is_active: rec.is_active !== false,
      books: [], // Will load real data below
    });
    setOpen(true);

    try {
      // Fetch full details (with books array)
      const res = await combosApi.getById(rec.id);
      const fullCombo = res.data.data;
      if (fullCombo) {
        form.setFieldsValue({
          books: fullCombo.books || [],
        });
      }
    } catch (e) {
      console.error("Lỗi khi tải chi tiết combo", e);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        name: values.name,
        cover_image_url: values.cover_image_url || null,
        original_total: values.original_total || 0,
        combo_price: values.combo_price || 0,
        stock_qty: values.stock_qty || 0,
        ends_at: values.ends_at ? values.ends_at.toISOString() : null,
        is_active: values.is_active,
        books: values.books || [],
      };
      if (editing) await crud.update(editing.id, payload);
      else await crud.create(payload);
      setOpen(false);
      message.success(editing ? "Cập nhật Combo thành công" : "Tạo Combo thành công");
    } catch (err) {
      if (err?.response) message.error(err.response.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Tên Combo",
      dataIndex: "name",
      render: (v, rec) => (
        <Space>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: rec.cover_image_url ? `url(${rec.cover_image_url}) center/cover` : "rgba(5, 150, 105, 0.1)",
              border: "1px solid rgba(5, 150, 105, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!rec.cover_image_url && <AppstoreAddOutlined style={{ color: "#059669", fontSize: 18 }} />}
          </div>
          <Text strong style={{ fontSize: 14 }}>{v}</Text>
        </Space>
      ),
    },
    {
      title: "Giá bán",
      render: (_, rec) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: "#059669", fontSize: 15 }}>₫ {fmt(rec.combo_price)}</Text>
          <Text delete type="secondary" style={{ fontSize: 12 }}>₫ {fmt(rec.original_total)}</Text>
        </Space>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock_qty",
      render: (v) => <Text strong>{fmt(v)}</Text>,
    },
    {
      title: "Hạn Flash Sale",
      dataIndex: "ends_at",
      render: (v) => (
        v ? <Text type="secondary">{new Date(v).toLocaleDateString("vi-VN")} {new Date(v).toLocaleTimeString("vi-VN")}</Text> : <Text type="secondary">—</Text>
      ),
    },
    {
      title: "Trạng thái",
      render: (_, rec) => {
        const s = comboStatus(rec);
        return <Tag color={s.color} style={{ borderRadius: 12 }}>{s.label}</Tag>;
      },
    },
    {
      key: "actions",
      width: 90,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#059669' }} />}
              onClick={() => openEdit(rec)}
            />
          </Tooltip>
          {currentUser?.role === "ADMIN" && (
            <Popconfirm
              title="Xóa Combo này?"
              description="Hành động này không thể hoàn tác."
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
            Quản lý Combo Sách
          </Title>
          <Text type="secondary">Tạo các gói Flash Sale hoặc bộ sách giảm giá</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ background: '#059669', height: 40, borderRadius: 8, fontWeight: 500 }}
        >
          Tạo Combo
        </Button>
      </div>

      <Card variant="outlined" style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} styles={{ body: { padding: 20 } }}>
        <div style={{ marginBottom: 20 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm theo tên combo..."
            value={crud.search}
            onChange={(e) => crud.handleSearch(e.target.value)}
            style={{ width: 320, borderRadius: 8, height: 40 }}
            allowClear
          />
        </div>
        <Table scroll={{ x: 900 }}
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
        title={<span style={{ fontFamily: "'Inter', sans-serif", fontSize: 20 }}>{editing ? "Chỉnh sửa Combo" : "Tạo Combo mới"}</span>}
        width={600}
        onClose={() => setOpen(false)}
        open={open}
        styles={{ body: { paddingBottom: 80, background: isDark ? '#18181B' : '#F9FAFB' } }}
        extra={
          <Space>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={handleOk} type="primary" loading={saving} style={{ background: '#059669' }}>
              {editing ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          
          <Card variant="outlined" title={<span style={{ color: '#059669' }}>Thông tin cơ bản</span>} style={{ borderRadius: 12, marginBottom: 16, background: isDark ? '#27272A' : '#ffffff', border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}` }}>
            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Tên Combo</span>}
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên combo' }]}
            >
              <Input size="large" placeholder="Ví dụ: Trọn bộ Harry Potter 7 Tập" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Ảnh bìa Combo (URL)</span>}
              name="cover_image_url"
            >
              <Input placeholder="https://..." style={{ borderRadius: 8 }} />
            </Form.Item>
          </Card>

          <Card variant="outlined" title={<span style={{ color: '#059669' }}>Sách trong Combo</span>} style={{ borderRadius: 12, marginBottom: 16, background: isDark ? '#27272A' : '#ffffff', border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}` }}>
            <Form.List name="books">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={16} style={{ marginBottom: 8, alignItems: 'center' }}>
                      <Col span={16}>
                        <Form.Item
                          {...restField}
                          name={[name, 'book_id']}
                          rules={[{ required: true, message: 'Chọn sách' }]}
                          style={{ margin: 0 }}
                        >
                          <Select
                            showSearch
                            placeholder="Chọn sách"
                            filterOption={(input, option) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={booksList.map(b => ({ label: b.title, value: b.id }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          rules={[{ required: true, message: 'SL' }]}
                          style={{ margin: 0 }}
                        >
                          <InputNumber placeholder="Số lượng" min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Button type="dashed" onClick={() => add({ quantity: 1 })} block icon={<PlusOutlined />} style={{ marginTop: 8 }}>
                    Thêm sách vào Combo
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          <Card variant="outlined" title={<span style={{ color: '#059669' }}>Định giá & Tồn kho</span>} style={{ borderRadius: 12, marginBottom: 16, background: isDark ? '#27272A' : '#ffffff', border: `1px solid ${isDark ? '#3F3F46' : '#E5E7EB'}` }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Tổng giá gốc (₫)</span>}
                  name="original_total"
                  rules={[{ required: true, message: 'Bắt buộc' }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Giá bán Combo (₫)</span>}
                  name="combo_price"
                  rules={[{ required: true, message: 'Bắt buộc' }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Số lượng tồn kho</span>}
                  name="stock_qty"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 500 }}>Hạn kết thúc Flash Sale</span>}
                  name="ends_at"
                >
                  <DatePicker
                    showTime
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Không giới hạn"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="is_active"
              valuePropName="checked"
              style={{ margin: 0, marginTop: 8 }}
            >
              <Switch checkedChildren="Đang mở bán" unCheckedChildren="Tạm ẩn" />
            </Form.Item>
          </Card>
        </Form>
      </Drawer>
    </>
  );
}
