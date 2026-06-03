import { Button, Card, Form, Input, message } from "antd";
import { login } from "../services/authApi";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [messageApi, contextHolder] = message.useMessage();

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const result = await login(values);

      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("employee_name", result.employee_name);
      localStorage.setItem("role", result.role);

      messageApi.success("登入成功");
      onLoginSuccess();
    } catch {
      messageApi.error("帳號或密碼錯誤");
    }
  };

  return (
    <>
      {contextHolder}

      <div className="login-page">
        <Card title="Resort VIP Admin Login" className="login-card">
          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "請輸入 Email" }]}
            >
              <Input placeholder="admin@resort.com" />
            </Form.Item>

            <Form.Item
              label="密碼"
              name="password"
              rules={[{ required: true, message: "請輸入密碼" }]}
            >
              <Input.Password placeholder="請輸入密碼" />
            </Form.Item>

            <Button type="primary" htmlType="submit" block>
              登入
            </Button>
          </Form>
        </Card>
      </div>
    </>
  );
}

export default LoginPage;