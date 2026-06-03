import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import EmployeeManagement from "./pages/EmployeeManagement";

function App() {
  const [isLogin, setIsLogin] = useState(
    !!localStorage.getItem("access_token")
  );

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("employee_name");
    localStorage.removeItem("role");
    setIsLogin(false);
  };

  if (!isLogin) {
    return <LoginPage onLoginSuccess={() => setIsLogin(true)} />;
  }

  return <EmployeeManagement onLogout={handleLogout} />;
}

export default App;