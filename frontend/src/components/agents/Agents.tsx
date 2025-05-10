import React, { useState } from 'react';
import { Button, Modal, Form, Input, Card, Tag, Tooltip } from 'antd';
import { MessageSquare, Trash2, Pause, Play, ArrowLeft } from 'lucide-react';
import './agents.scss';

// Components
import Chat from '../chat/Chat';
import AgentModal from './AddAgentModal';

// Localization
import LOCALIZATION from '../../services/LocalizationService';
import AgentCard from './AgentCard';

const Agents: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatMode, setChatMode] = useState(false); // track chat screen

  type AgentStatus = 'Connected' | 'Not Connected';

  interface Agent {
    id: number;
    name: string;
    provider: string;
    description: string;
    status: AgentStatus;
    tags: string[];
  }

  const agents: Agent[] = [
    {
      id: 1,
      name: 'GitHub Agent',
      provider: 'github',
      description: 'Monitors GitHub pull requests and provides summaries and analysis',
      status: 'Connected',
      tags: ['github', 'analyze', 'summarize'],
    },
    {
      id: 2,
      name: 'Slack Notifier',
      provider: 'slack',
      description: 'Sends notifications to Slack channels based on events',
      status: 'Connected',
      tags: ['slack'],
    },
    {
      id: 3,
      name: 'Jira Ticket Manager',
      provider: 'jira',
      description: 'Creates and updates Jira tickets based on natural language requests',
      status: 'Not Connected',
      tags: ['jira'],
    },
  ];

  const handleSubmit = (values: any) => {
    console.log('Form values:', values);
    setIsModalOpen(false);
  };

  if (chatMode) {
    return (
     <Chat onBack={() => setChatMode(false)} />
    );
  }

  return (
    <div className="agents-screen">
      <div className="agents-header">
        <h1>{LOCALIZATION.AGENTS}</h1>
        <Button 
          type="primary" 
          onClick={() => setIsModalOpen(true)}
          className="configure-button"
        >
          { LOCALIZATION.ADD_AGENT } 
        </Button>
      </div>

      <div className="agents-grid">
        {agents.map((agent) => (
          <AgentCard 
            id={agent.id}
            name={agent.name}
            provider={agent.provider}
            description={agent.description}
            status={agent.status}
            tags={agent.tags}
            setChatMode={setChatMode}
          />
        ))}
      </div>

      <AgentModal
          visible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={() => {}}
        />
      {/* <Modal
        title="Configure New Agent"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter agent name' }]}
          >
            <Input placeholder="Enter agent name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal> */}
    </div>
  );
};

export default Agents;
