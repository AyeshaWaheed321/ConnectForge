import React, { useState } from 'react';
import { Layout as AntLayout } from 'antd';
import Sidebar from './Sidebar';
import Dashboard from '../dashboard/Dashboard';
import Agents from '../agents/Agents';
import Chat from '../chat/Chat';
import './layout.scss';

const { Content } = AntLayout;

const Layout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'agents':
        return <Agents onChatClick={() => setCurrentPage('chat')} />;
      case 'chat':
        return <Chat />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AntLayout className="app-layout">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <AntLayout>
        <Content className="layout-content">
          {renderContent()}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;