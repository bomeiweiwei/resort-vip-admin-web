import { useEffect, useState } from "react";
import { Button, Layout, Menu, Space, Table, Tag } from "antd";
import { getEmployees } from "../services/employeeApi";
import type { Employee } from "../services/employeeApi";

const { Header, Content } = Layout;

interface EmployeeManagementProps {
  onLogout: () => void;
}

function EmployeeManagement({ onLogout }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const employeeName = localStorage.getItem("employee_name");

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

  return (
    <Layout>
      <Header className="top-header">
        <div className="brand">Resort VIP Admin</div>

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={["employees"]}
          items={[
            {
              key: "employees",
              label: "員工管理",
            },
          ]}
        />

        <div className="user-info">
          {employeeName}
          <Button size="small" onClick={onLogout}>
            登出
          </Button>
        </div>
      </Header>

      <Content className="page-content">
        <h2>員工管理</h2>

        <Space className="toolbar">
          <Button type="primary">新增員工</Button>
          <Button onClick={loadEmployees}>重新整理</Button>
        </Space>

        <Table
          rowKey="employee_id"
          columns={columns}
          dataSource={employees}
        />
      </Content>
    </Layout>
  );
}

export default EmployeeManagement;