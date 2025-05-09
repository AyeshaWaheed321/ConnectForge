import React, { useState } from "react";
import { Modal, Button, Form, Typography, message } from "antd";
import { JsonEditor } from "../common/JsonEditor";
import "./agentModal.css";

const { Title, Paragraph } = Typography;

const defaultAgentJson = {
  "version": "1.0",
  "agentId": "unique-agent-id",
  "name": "Display Name",
  "description": "Brief description of the agent.",
  "tags": ["example", "research"],
  "priority": 10,
  "personality": [
    "Personality trait 1",
    "Personality trait 2"
  ],
  "nodes": [
    "llm.openai",
    "search"
  ],
  "nodeConfigurations": {
    "llm.openai": {
      "model": "YOUR_CHOSEN_MODEL",
      "temperature": 0.7
    }
  }
};

interface AgentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (agentData: any) => void;
}

const AgentModal: React.FC<AgentModalProps> = ({ visible, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [jsonValue, setJsonValue] = useState<string>(JSON.stringify(defaultAgentJson, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleJsonChange = (value: string | undefined) => {
    if (!value) {
      setJsonValue("");
      setJsonError("JSON cannot be empty");
      return;
    }

    setJsonValue(value);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (error) {
      if (error instanceof Error) {
        setJsonError(`Invalid JSON: ${error.message}`);
      } else {
        setJsonError("Invalid JSON");
      }
    }
  };

  const handleSubmit = () => {
    if (jsonError) {
      message.error("Please fix JSON errors before submitting");
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonValue);
      onSubmit(parsedJson);
      form.resetFields();
    } catch (error) {
      message.error("Failed to parse JSON");
    }
  };

  return (
    <Modal
      title="Add New Agent"
      open={visible}
      onCancel={onClose}
      width={700}
      className="agent-modal"
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={!!jsonError}
          className="submit-button"
        >
          Create Agent
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Paragraph className="agent-description">
          Create a new agent by providing its JSON configuration. Your submission will be reviewed before being made available.
        </Paragraph>
        <Form.Item
          label="Agent Configuration (JSON)"
          validateStatus={jsonError ? "error" : ""}
          help={jsonError}
          className="agent-form-item"
        >
          <JsonEditor
            value={jsonValue}
            onChange={handleJsonChange}
            height="300px"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AgentModal;