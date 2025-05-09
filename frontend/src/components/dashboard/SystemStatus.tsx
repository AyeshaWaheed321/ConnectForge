import React from 'react';
import ProgressBar from '../common/ProgressBar';

const SystemStatus: React.FC = () => {
  return (
    <div className="system-status">
      <div className="status-section">
        <h3 className="status-section-title">System Health</h3>
        <div className="status-list">
          <div className="status-item">
            <h4 className="status-label">API Server</h4>
            <span className="status-value status-online">Online</span>
          </div>
          <div className="status-item">
            <h4 className="status-label">Agent Network</h4>
            <span className="status-value status-connected">Connected</span>
          </div>
          <div className="status-item">
            <h4 className="status-label">LLM Service</h4>
            <span className="status-value status-available">Available</span>
          </div>
          <div className="status-item">
            <h4 className="status-label">Tool Registry</h4>
            <span className="status-value status-operational">Operational</span>
          </div>
        </div>
      </div>

      <div className="status-section">
        <h3 className="status-section-title">Resource Usage</h3>
        <div className="resource-list">
          <div className="resource-item">
            <div className="resource-header">
              <h4 className="resource-label">CPU</h4>
              <span className="resource-value">28%</span>
            </div>
            <ProgressBar value={28} type="cpu" />
          </div>
          <div className="resource-item">
            <div className="resource-header">
              <h4 className="resource-label">Memory</h4>
              <span className="resource-value">42%</span>
            </div>
            <ProgressBar value={42} type="memory" />
          </div>
          <div className="resource-item">
            <div className="resource-header">
              <h4 className="resource-label">Network</h4>
              <span className="resource-value">15%</span>
            </div>
            <ProgressBar value={15} type="network" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;