import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Hammer, 
  ActivitySquare, 
  Settings 
} from 'lucide-react';

const { Sider } = Layout;

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  return (
    <Sider width={200} theme="dark" className="app-sidebar">
      <div className="logo">
        <Users size={24} color="#fff" />
        <span className="logo-text">AgentDock</span>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentPage]}
        style={{ height: '100%', borderRight: 0 }}
        items={[
          {
            key: 'dashboard',
            icon: <LayoutDashboard size={16} />,
            label: 'Dashboard',
            onClick: () => onPageChange('dashboard'),
          },
          {
            key: 'agents',
            icon: <Users size={16} />,
            label: 'Agents',
            onClick: () => onPageChange('agents'),
          },
          {
            key: 'chat',
            icon: <MessageSquare size={16} />,
            label: 'Chat',
            onClick: () => onPageChange('chat'),
          },
          {
            key: 'tools',
            icon: <Hammer size={16} />,
            label: 'Tools',
            onClick: () => onPageChange('tools'),
          },
          {
            key: 'monitoring',
            icon: <ActivitySquare size={16} />,
            label: 'Monitoring',
            onClick: () => onPageChange('monitoring'),
          },
          {
            key: 'settings',
            icon: <Settings size={16} />,
            label: 'Settings',
            onClick: () => onPageChange('settings'),
          },
        ]}
      />
      <div className="sidebar-footer">
        AgentDock v1.0.0
      </div>
    </Sider>
  );
};

export default Sidebar;