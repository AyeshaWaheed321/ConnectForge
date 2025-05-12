import React from "react";
import { Layout as AntLayout } from "antd";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Dashboard from "../dashboard/Dashboard";
import Agents from "../agents/Agents";
import "./layout.scss";

// constants
import { ROUTES } from "../../constants/Routes";
import Chat from "../chat/Chat";

const { Content } = AntLayout;

const Layout: React.FC = () => {
  return (
    <AntLayout className="app-layout">
      <Sidebar />
      <AntLayout>
        <Content className="layout-content">
          <Routes>
            {/* Define your routes here */}
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.AGENTS} element={<Agents />} />
            <Route path={ROUTES.CHAT + "/:agentId"} element={<Chat />} />
          </Routes>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
