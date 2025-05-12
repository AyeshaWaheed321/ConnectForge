import React from 'react';
import { Modal, Form, Input, Button } from 'antd';
import './AgentConfigModal.css';

interface AgentConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: AgentConfigFormValues) => void;
}

export interface AgentConfigFormValues {
  apiToken: string;
  email: string;
  repoUrl: string;
}

const AgentConfigModal: React.FC<AgentConfigModalProps> = ({ 
  visible, 
  onClose, 
  onSubmit 
}) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        onSubmit(values);
        form.resetFields();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title="Agent Configuration"
      open={visible}
      onCancel={onClose}
      footer={null}
      className="agent-config-modal"
    >
      <p className="modal-description">
        Configure global settings and API Keys for your agents
      </p>
      
      <Form
        form={form}
        layout="vertical"
        name="agentConfigForm"
        className="agent-config-form"
      >
        <Form.Item
          label="API Token"
          name="apiToken"
          rules={[{ required: true, message: 'Please enter API Token' }]}
        >
          <Input placeholder="Enter Values" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter Email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input placeholder="Enter Email Address" />
        </Form.Item>

        <Form.Item
          label="Enter Repo URL"
          name="repoUrl"
          rules={[{ required: true, message: 'Please enter Repo URL' }]}
        >
          <Input placeholder="Enter URL" />
        </Form.Item>

        <div className="form-actions">
          <Button onClick={onClose} className="cancel-button">
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={handleSubmit} 
            className="submit-button"
          >
            Save Configuration
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AgentConfigModal;