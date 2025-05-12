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

const { Paragraph } = Typography;
const { AGENTS_TEMPLATE, RESPONSE } = REDUX_STATES || {};

interface AgentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (agentData: any) => void;
  defaultValue?: object;
  modalTitle?: string;
  loading?: boolean;
}

const AgentModal: React.FC<AgentModalProps> = ({
  visible,
  onClose,
  onSubmit,
  defaultValue,
  modalTitle,
  loading = false,
}) => {
  console.log("AgentModal", defaultValue);

  const dispatch = useAppDispatch();
  const { [AGENTS_TEMPLATE + RESPONSE]: defaultTemplate = null } = useSelector(
    (state: any) => state?.crud
  );

  const [form] = Form.useForm();
  const [jsonValue, setJsonValue] = useState<string>("{}");
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return; // Only reset when modal is opened

    if (defaultValue) {
      setJsonValue(JSON.stringify(defaultValue, null, 2));
    } else if (defaultTemplate?.data) {
      try {
        setJsonValue(JSON.stringify(defaultTemplate.data, null, 2));
      } catch {
        setJsonValue("{}");
      }
    }
  }, [visible, defaultValue, defaultTemplate]);

  useEffect(() => {
    if (!defaultValue && defaultTemplate === null) {
      dispatch(getAction(URLS.GET_AGENT_ADD_TEMPLATE, {}, AGENTS_TEMPLATE));
    }
  }, [defaultValue, defaultTemplate, dispatch]);

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
      setJsonError(
        error instanceof Error
          ? `Invalid JSON: ${error.message}`
          : "Invalid JSON"
      );
    }
  };

  const handleSubmit = () => {
    if (jsonError) {
      message.error("Please fix JSON errors before submitting");
    } else {
      try {
        const parsedJson = JSON.parse(jsonValue);
        onSubmit(parsedJson);
        form.resetFields();
      } catch {
        message.error("Failed to parse JSON");
      }
    }
  };

  const modalFooter = [
    <Button key="cancel" onClick={onClose} disabled={loading}>
      {LOCALIZATION.CANCEL}
    </Button>,
    <Button
      key="submit"
      type="primary"
      onClick={handleSubmit}
      disabled={!!jsonError || loading}
      className="submit-button"
    >
      {defaultValue ? LOCALIZATION.SAVE_CHANGES : LOCALIZATION.CREATE_AGENT}
    </Button>,
  ];

  const modalContent = (
    <Form form={form} layout="vertical">
      {!defaultValue && (
        <Paragraph className="agent-description">
          {LOCALIZATION.AGENT_MODAL_DESCRIPTION}
        </Paragraph>
      )}
      <Form.Item
        label="Agent Configuration (JSON)"
        validateStatus={jsonError ? "error" : ""}
        help={jsonError}
        className="agent-form-item"
      >
        <JsonEditor value={jsonValue} onChange={handleJsonChange} />
      </Form.Item>
    </Form>
  );

  return (
    <GenericModal
      visible={visible}
      title={modalTitle || "Add New Agent"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={modalFooter}
      content={modalContent}
    />
  );
};

export default AgentModal;
