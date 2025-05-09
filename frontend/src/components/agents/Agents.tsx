import React, { useState } from 'react';
import { Button, Modal, Form, Input, Card, Tag, Tooltip } from 'antd';
import { MessageSquare, Trash2, Pause, Play } from 'lucide-react';
import './agents.scss';

interface AgentsProps {
  onChatClick: () => void;
}

const Agents: React.FC<AgentsProps> = ({ onChatClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="agents-screen">
      <div className="agents-header">
        <h1>Agents</h1>
        <Button 
          type="primary" 
          onClick={() => setIsModalOpen(true)}
          className="configure-button"
        >
          + Configure
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
                <Button icon={<MessageSquare size={16} />} onClick={onChatClick} />
              </Tooltip>
              <Tooltip title="Delete">
                <Button icon={<Trash2 size={16} />} danger />
              </Tooltip>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title="Configure New Agent"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmit}
        >
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
      </Modal>
    </div>
  );
};

export default Agents;