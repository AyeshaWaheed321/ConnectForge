import React, { useState } from 'react';
import { Layout as AntLayout } from 'antd';
import Sidebar from './Sidebar';
import Dashboard from '../dashboard/Dashboard';
import Agents from '../agents/Agents';
import Chat from '../chat/Chat';
import './layout.scss';

// constants
import { ROUTES } from '../../constants/Routes';

const { Content } = AntLayout;

const Layout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderContent = () => {
    switch (currentPage) {
      case ROUTES.DASHBOARD:
        return <Dashboard />;
      case ROUTES.AGENTS:
        return <Agents />;
      case ROUTES.CHAT:
        return <Dashboard />;
        // return <Chat />;
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