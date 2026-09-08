import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Form, Input, Button, Alert, Typography } from "antd";
import {
  MailOutlined,
  LockOutlined,
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login, user, isDark, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" replace />;

  const pageBg = isDark ? "#111b15" : "#eef3eeff";
  const cardBg = isDark ? "#1a261f" : "#f1f5eb";
  const textColorPrimary = isDark ? "#e4ebe4" : "#12422b";
  const textColorSecondary = isDark ? "#8ca898" : "#4b6b58";
  const inputBorder = isDark ? "#3d5746" : "#a3b8aa";

  const onFinish = async ({ email, password }) => {
    setError("");
    setLoading(true);
    try {
      const u = await login(email, password);
      if (!["ADMIN", "STAFF"].includes(u.role)) {
        setError("Tài khoản này không có quyền truy cập trang quản trị.");
        return;
      }
      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Lỗi kết nối API",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: pageBg,
        position: "relative",
        overflow: "hidden",
        padding: "0 4%",
        transition: "background 0.3s ease",
      }}
    >
      {/* Theme toggle top-right */}
      <div style={{ position: "absolute", top: 24, right: 32, zIndex: 10 }}>
        <Button
          type="text"
          icon={
            isDark ? (
              <SunOutlined style={{ color: "#faad14", fontSize: 20 }} />
            ) : (
              <MoonOutlined style={{ color: "#12422b", fontSize: 20 }} />
            )
          }
          onClick={toggleTheme}
        />
      </div>

      {/* Decorative blobs/leaves effect in background */}
      <div
        style={{
          position: "absolute",
          top: -50,
          left: -50,
          width: 300,
          height: 300,
          background: isDark
            ? "radial-gradient(circle, rgba(104,159,56,0.15) 0%, rgba(17,27,21,0) 70%)"
            : "radial-gradient(circle, rgba(104,159,56,0.15) 0%, rgba(255,255,255,0) 70%)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -50,
          left: -50,
          width: 400,
          height: 400,
          background: isDark
            ? "radial-gradient(circle, rgba(104,159,56,0.18) 0%, rgba(17,27,21,0) 70%)"
            : "radial-gradient(circle, rgba(104,159,56,0.2) 0%, rgba(255,255,255,0) 70%)",
          borderRadius: "50%",
        }}
      />

      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 1300,
          alignItems: "center",
          gap: 40,
          zIndex: 1,
        }}
      >
        {/* ── Left Text ───────────────────────── */}
        <div style={{ flex: 1.2 }}>
          <Title
            style={{
              color: textColorPrimary,
              marginBottom: 20,
              fontWeight: 700,
              fontSize: 54,
              lineHeight: 1.2,
              fontFamily: "Georgia, serif", // Serif font like in the image
            }}
          >
            Quản lý Nhà sách
            <br />
            thông minh
          </Title>
          <Text
            style={{
              color: textColorPrimary,
              fontSize: 18,
              display: "block",
              maxWidth: 420,
              lineHeight: 1.6,
            }}
          >
            Nền tảng quản trị tối ưu, đồng hành cùng bạn trên từng trang sách và
            khách hàng.
          </Text>
        </div>

        {/* ── Center Image ───────────────────────── */}
        <div style={{ flex: 1.5, display: "flex", justifyContent: "center" }}>
          <img
            src="/logo1.png"
            alt="Illustration"
            style={{
              maxWidth: "100%",
              maxHeight: "85vh",
              objectFit: "contain",
              filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.05))",
            }}
          />
        </div>

        {/* ── Right login form ─────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 380, maxWidth: 420 }}>
          <div
            style={{
              background: cardBg,
              borderRadius: 24,
              padding: "48px 40px",
              boxShadow: isDark
                ? "0 24px 50px rgba(0, 0, 0, 0.2)"
                : "0 24px 50px rgba(18, 66, 43, 0.08)",
              position: "relative",
              transition: "background 0.3s ease",
            }}
          >
            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <img
                src="/logo.png"
                alt="BookMart Logo"
                style={{ height: 80, marginBottom: 16 }}
              />
              <Title
                level={4}
                style={{
                  margin: "0 0 8px",
                  color: textColorPrimary,
                  fontWeight: 700,
                }}
              >
                Đăng nhập hệ thống
              </Title>
              <Text style={{ color: textColorSecondary, fontSize: 13 }}>
                Vui lòng nhập thông tin để tiếp tục
              </Text>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError("")}
                style={{ marginBottom: 24, borderRadius: 8 }}
              />
            )}

            <Form
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                label={
                  <span
                    style={{
                      color: textColorPrimary,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Email
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
                style={{ marginBottom: 20 }}
              >
                <Input
                  id="login-email"
                  prefix={
                    <MailOutlined
                      style={{ color: textColorSecondary, marginRight: 8 }}
                    />
                  }
                  placeholder="admin@bookmart.vn"
                  style={{
                    background: "transparent",
                    borderColor: inputBorder,
                    borderRadius: 8,
                    height: 44,
                    color: textColorPrimary,
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{
                      color: textColorPrimary,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Mật khẩu
                  </span>
                }
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                style={{ marginBottom: 32 }}
              >
                <Input.Password
                  id="login-password"
                  prefix={
                    <LockOutlined
                      style={{ color: textColorSecondary, marginRight: 8 }}
                    />
                  }
                  placeholder="Nhập mật khẩu của bạn"
                  iconRender={(visible) =>
                    visible ? (
                      <EyeTwoTone />
                    ) : (
                      <EyeInvisibleOutlined
                        style={{ color: textColorSecondary }}
                      />
                    )
                  }
                  style={{
                    background: "transparent",
                    borderColor: inputBorder,
                    borderRadius: 8,
                    height: 44,
                    color: textColorPrimary,
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  id="login-submit"
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  icon={<ArrowRightOutlined />}
                  iconPlacement="end"
                  size="large"
                  style={{
                    height: 46,
                    borderRadius: 24, // Capsule shape
                    background: "#689f38", // Solid green matching image button, but lighter
                    fontWeight: 600,
                    boxShadow: "0 8px 20px rgba(104, 159, 56, 0.3)",
                  }}
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            <Text
              style={{
                textAlign: "center",
                marginTop: 32,
                fontSize: 11,
                display: "block",
                color: textColorSecondary,
              }}
            >
              BookMart Admin &copy; {new Date().getFullYear()}
              <br />
              Chỉ dành cho tài khoản ADMIN &amp; STAFF
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
