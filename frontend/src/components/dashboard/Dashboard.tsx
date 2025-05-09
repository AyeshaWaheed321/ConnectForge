

import React, { useEffect } from 'react';
import { Row, Col } from 'antd';
import StatusCard from './StatusCard';
import ActivityOverview from './ActivityOverview';
import SystemStatus from './SystemStatus';
import './dashboard.scss';

import {  useSelector } from 'react-redux';
import  useAppDispatch  from '../../hooks/useAppDispatch';

import { getAction } from '../../store/actions/crudActions';

const Dashboard: React.FC = () => {

  const dispatch = useAppDispatch();
  
    useEffect(() => {
    dispatch(getAction("/api/dashboard", {}, "dashboard"));
  }, []);


  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatusCard 
            title="Agents"
            value="2/3"
            percentage={1.2}
            type="primary"
            icon="users"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatusCard 
            title="Tools"
            value="3/4"
            percentage={1.5}
            type="info"
            icon="hammer"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatusCard 
            title="Successful Tasks"
            value="35"
            percentage={2.3}
            type="success"
            icon="check"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatusCard 
            title="Failed Tasks"
            value="24"
            percentage={1.9}
            type="error"
            icon="x"
          />
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className="dashboard-sections">
        <Col xs={24} lg={12}>
          <h2 className="section-title">Activity Overview</h2>
          <ActivityOverview />
        </Col>
        <Col xs={24} lg={12}>
          <h2 className="section-title">Status</h2>
          <SystemStatus />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;