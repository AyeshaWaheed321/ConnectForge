import React from "react";
import { Layout, Menu } from "antd";
import { LayoutDashboard, Users, MessageSquare } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom"; // Import necessary hooks

const { Sider } = Layout;

interface SidebarProps {
  // Removed `currentPage` prop as we'll get the current path from `useLocation`
}

const Sidebar: React.FC<SidebarProps> = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location from react-router-dom

  // Function to handle page change
  const handlePageChange = (page: string) => {
    navigate(page); // Use navigate to change routes programmatically
  };

  return (
    <Sider width={200} theme="dark" className="app-sidebar">
      <div className="logo">
        <Users size={24} color="#fff" />
        <span className="logo-text">AgentDock</span>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]} // Dynamically set selected key based on the current URL
        style={{ borderRight: 0 }}
      >
        <Menu.Item
          key="/dashboard" // Use the route path
          icon={<LayoutDashboard size={16} />}
          onClick={() => handlePageChange("/dashboard")}
        >
          Dashboard
        </Menu.Item>
        <Menu.Item
          key="/agents"
          icon={<Users size={16} />}
          onClick={() => handlePageChange("/agents")}
        >
          Agents
        </Menu.Item>
        <Menu.Item
          key="/chat"
          icon={<MessageSquare size={16} />}
          onClick={() => handlePageChange("/chat")}
        >
          Chat
        </Menu.Item>
      </Menu>
      <div className="sidebar-footer">AgentDock v1.0.0</div>
    </Sider>
  );
};

export default Sidebar;
