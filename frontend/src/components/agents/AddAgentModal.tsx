import React, { useEffect, useState } from "react";
import { Button, Form, Typography, message } from "antd";
import { JsonEditor } from "../common/JsonEditor";
import URLS from "../../constants/UrlConstants";
import { REDUX_STATES } from "../../constants/ReduxStates";
import useAppDispatch from "../../hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { getAction } from "../../store/actions/crudActions";
import LOCALIZATION from "../../services/LocalizationService";
import GenericModal from "../common/GenericModal";

const { Title, Paragraph } = Typography;
const { AGENTS_TEMPLATE, RESPONSE } = REDUX_STATES || {};

interface AgentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (agentData: any) => void;
}

const AgentModal: React.FC<AgentModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const dispatch = useAppDispatch();
  const { [AGENTS_TEMPLATE + RESPONSE]: defaultTemplate = null } = useSelector(
    (state: any) => state?.crud
  );

  const [form] = Form.useForm();
  const [jsonValue, setJsonValue] = useState<string>(
    JSON.stringify({}, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultTemplate === null) {
      dispatch(getAction(URLS.GET_AGENT_ADD_TEMPLATE, {}, AGENTS_TEMPLATE));
    } else {
      setJsonValue(JSON.stringify(defaultTemplate?.data));
    }
  }, [defaultTemplate]);

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

  const modalFooter = [
    <Button key="cancel" onClick={onClose}>
      {LOCALIZATION.CANCEL}
    </Button>,
    <Button
      key="submit"
      type="primary"
      onClick={handleSubmit}
      disabled={!!jsonError}
      className="submit-button"
    >
      {LOCALIZATION.CREATE_AGENT}
    </Button>,
  ];

  const modalContent = (
    <Form form={form} layout="vertical">
      <Paragraph className="agent-description">
        {LOCALIZATION.AGENT_MODAL_DESCRIPTION}
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
  );

  return (
    <GenericModal
      visible={visible}
      title="Add New Agent"
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={modalFooter}
      content={modalContent}
    />
  );
};

export default AgentModal;
