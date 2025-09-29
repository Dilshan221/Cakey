import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Stats from "./components/Stats";
import EmployeeCards from "./components/EmployeeCards";
import AttendanceList from "./components/AttendanceList";
import UserManagement from "./components/UserManagement";
import SalaryManagement from "./components/SalaryManagement";
import FinanceManagement from "./components/FinanceManagement";
import DiscountManagement from "./components/DiscountManagement";
import "./App.css";

function App() {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <>
            <Stats />
            <EmployeeCards />
            <AttendanceList />
          </>
        );
      case "users":
        return <UserManagement />;
      case "attendance":
        return <AttendanceList />;
      case "salary":
        return <SalaryManagement />;
      case "finance":
        return <FinanceManagement />;
      case "discount":
        return <DiscountManagement />;
      default:
        return (
          <>
            <Stats />
            <EmployeeCards />
            <AttendanceList />
          </>
        );
    }
  };

  return (
    <div className="container">
      <Sidebar
        isActive={sidebarActive}
        toggleSidebar={toggleSidebar}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <section className={`main ${sidebarActive ? "active" : ""}`}>
        <Header />
        {renderContent()}
      </section>
    </div>
  );
}

export default App;
