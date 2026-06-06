import { useState } from "react";
import { Button, Layout, Menu } from "antd";

import LoginPage from "./pages/LoginPage";
import EmployeeManagement from "./pages/EmployeeManagement";
import CheckInPage from "./pages/CheckInPage";
import ItineraryRecommendationPage from "./pages/ItineraryRecommendationPage";

const { Header, Content } = Layout;

function App() {
  const [isLogin, setIsLogin] = useState(
    !!localStorage.getItem("access_token")
  );

  const [currentPage, setCurrentPage] = useState("employees");

  const employeeName = localStorage.getItem("employee_name");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("employee_name");
    localStorage.removeItem("role");
    setIsLogin(false);
  };

  if (!isLogin) {
    return <LoginPage onLoginSuccess={() => setIsLogin(true)} />;
  }

  return (
    <Layout>
      <Header className="top-header">
        <div className="brand">Resort VIP Admin</div>

        <Menu
          className="top-menu"
          theme="dark"
          mode="horizontal"
          selectedKeys={[currentPage]}
          onClick={(e) => setCurrentPage(e.key)}
          items={[
            {
              key: "employees",
              label: "員工管理",
            },
            {
              key: "checkin",
              label: "辦理入住",
            },
            {
              key: "itinerary",
              label: "推薦行程",
            },
          ]}
        />

        <div className="user-info">
          {employeeName}
          <Button size="small" onClick={handleLogout}>
            登出
          </Button>
        </div>
      </Header>

      <Content className="page-content">
        {currentPage === "employees" && <EmployeeManagement />}
        {currentPage === "checkin" && <CheckInPage />}
        {currentPage === "itinerary" && <ItineraryRecommendationPage />}
      </Content>
    </Layout>
  );
}

export default App;