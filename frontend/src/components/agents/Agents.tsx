import React, { useState } from 'react';
import { Button, Modal, Form, Input, Card, Tag, Tooltip } from 'antd';
import { MessageSquare, Trash2, Pause, Play, ArrowLeft } from 'lucide-react';
import './agents.scss';

// Components
import Chat from '../chat/Chat';
import AgentModal from './AddAgentModal';

// Localization
import LOCALIZATION from '../../services/LocalizationService';

const Agents: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatMode, setChatMode] = useState(false); // track chat screen

  const agents = [
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
          <Card key={agent.id} className="agent-card">
            <div className="agent-header">
              <h3>{agent.name}</h3>
              <Tag color={agent.status === 'Connected' ? 'success' : 'default'}>
                {agent.status}
              </Tag>
            </div>
            <p className="provider">{agent.provider}</p>
            <p className="description">{agent.description}</p>
            <div className="tags">
              {agent.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            <div className="agent-actions">
              {agent.status === 'Connected' ? (
                <Button icon={<Pause size={16} />}>Pause</Button>
              ) : (
                <Button icon={<Play size={16} />}>Start</Button>
              )}
              <Tooltip title="Chat">
                <Button icon={<MessageSquare size={16} />} onClick={() => setChatMode(true)} />
              </Tooltip>
              <Tooltip title="Delete">
                <Button icon={<Trash2 size={16} />} danger />
              </Tooltip>
            </div>
          </Card>
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
