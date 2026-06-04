import { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Space, Table, Tag, message  } from "antd";
import { createEmployee, getEmployees } from "../services/employeeApi";
import type { CreateEmployeeRequest, Employee } from "../services/employeeApi";

function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<CreateEmployeeRequest>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const result = await getEmployees();
    setEmployees(result);
  };

  const columns = [
    {
      title: "員工編號",
      dataIndex: "employee_code",
    },
    {
      title: "姓名",
      dataIndex: "employee_name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "角色",
      dataIndex: "role",
    },
    {
      title: "部門",
      dataIndex: "department",
    },
    {
      title: "狀態",
      dataIndex: "is_active",
      render: (value: boolean) =>
        value ? <Tag color="green">啟用</Tag> : <Tag color="red">停用</Tag>,
    },
  ];

  const handleCreateEmployee = async () => {
    try {
      const values = await form.validateFields();

      await createEmployee(values);

      messageApi.success("新增員工成功");

      form.resetFields();
      setIsModalOpen(false);

      await loadEmployees();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "新增員工失敗";

      messageApi.error(errorMessage);
    }
  };

  return (
    <>
      {contextHolder}

      <h2>員工管理</h2>

      <Space className="toolbar">
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          新增員工
        </Button>
        <Button onClick={loadEmployees}>重新整理</Button>
      </Space>

      <Table
        rowKey="employee_id"
        columns={columns}
        dataSource={employees}
      />

      <Modal
        title="新增員工"
        open={isModalOpen}
        onOk={handleCreateEmployee}
        onCancel={() => {
          form.resetFields();
          setIsModalOpen(false);
        }}
        okText="新增"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="員工編號"
            name="employee_code"
            rules={[{ required: true, message: "請輸入員工編號" }]}
          >
            <Input placeholder="EMP002" />
          </Form.Item>

          <Form.Item
            label="姓名"
            name="employee_name"
            rules={[{ required: true, message: "請輸入姓名" }]}
          >
            <Input placeholder="王小明" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "請輸入 Email" },
              { type: "email", message: "Email 格式不正確" },
            ]}
          >
            <Input placeholder="user@resort.com" />
          </Form.Item>

          <Form.Item
            label="密碼"
            name="password"
            rules={[{ required: true, message: "請輸入密碼" }]}
          >
            <Input.Password placeholder="請輸入密碼" />
          </Form.Item>

          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: "請選擇角色" }]}
          >
            <Select placeholder="請選擇角色">
              <Select.Option value="Admin">Admin</Select.Option>
              <Select.Option value="Manager">Manager</Select.Option>
              <Select.Option value="Staff">Staff</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="部門" name="department">
            <Input placeholder="資訊部" />
          </Form.Item>
        </Form>
      </Modal>

    </>
  );
}

export default EmployeeManagement;