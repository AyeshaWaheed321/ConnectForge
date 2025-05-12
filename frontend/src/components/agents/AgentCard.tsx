import React, { useState } from "react";
import { Card, Button, Tooltip, Modal, message } from "antd";
import { MessageCircle, Settings, Trash, Pause, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAction, patchAction } from "../../store/actions/crudActions";
import useAppDispatch from "../../hooks/useAppDispatch";
import URLS from "../../constants/UrlConstants";
import { REDUX_STATES } from "../../constants/ReduxStates";
import { useSelector } from "react-redux";

import "./AgentCard.css";
import AgentModal from "./AddAgentModal";

export interface AgentProps {
  id: string;
  name: string;
  description: string;
  status: "Connected" | "Not Connected";
  tags: string[];
  handleDelete: (id: string) => void;
}

const TAG_ROW_LIMIT = 2;
const TAGS_PER_ROW_ESTIMATE = 2;
const visibleTagCount = TAG_ROW_LIMIT * TAGS_PER_ROW_ESTIMATE;

const { FETCH_AGENT_DETAILS, RESPONSE, LOADING, ERROR, AGENTS } =
  REDUX_STATES || {};
export const AgentCard: React.FC<AgentProps> = ({
  id,
  name,
  description,
  status,
  tags,
  handleDelete,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [editModalVisible, setEditModalVisible] = useState(false);

  const {
    [FETCH_AGENT_DETAILS + RESPONSE]: agentData = {},
    [FETCH_AGENT_DETAILS + LOADING]: agentDataLoading = false,
    [FETCH_AGENT_DETAILS + ERROR]: agentDataError = false,
  } = useSelector((state: any) => state?.crud);

  const handleEditClick = () => {
    dispatch(
      getAction(URLS.AGENT_BY_ID.replace(":id", id), {}, FETCH_AGENT_DETAILS)
    );
    setEditModalVisible(true);
  };

  const handleEditSubmit = (agentJson: any) => {
    dispatch(
      patchAction(
        URLS.AGENT_BY_ID.replace(":id", id),
        agentJson,
        null,
        "PATCH_AGENT"
      )
    ).then(() => {
      if (agentDataError) {
        message.error("Failed to update agent");
      } else {
        message.success("Agent updated successfully");
        // ✅ Refresh agents list
        dispatch(getAction(URLS.AGENTS, {}, AGENTS));
      }
    });

    setEditModalVisible(false);
  };

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const remainingCount = tags.length - visibleTagCount;

  const handleChatClick = () => {
    navigate(`/chat/${id}`);
  };

  const showDeleteModal = () => {
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    handleDelete(id);
    setDeleteModalVisible(false);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  return (
    <>
      <Card className="agent-card">
        <div className="agent-header">
          <h3 className="agent-name">{name}</h3>
          <span
            className={`status-badge ${
              status === "Connected" ? "connected" : "disconnected"
            }`}
          >
            {status}
          </span>
        </div>

        <p className="agent-description">{description}</p>

        {tags.length > 0 && <p className="agent-tools-heading">Tools</p>}

        <div className="agent-tags-wrapper">
          <div className="agent-tags">
            {tags.slice(0, visibleTagCount).map((tag) => (
              <span key={tag} className="agent-tag">
                {tag}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="agent-tag more-tag">+{remainingCount} more</span>
            )}
          </div>
        </div>

        <div className="agent-actions">
          <Tooltip title="Chat with agent">
            <Button
              type="text"
              icon={<MessageCircle size={18} />}
              onClick={handleChatClick}
              className="action-button"
            />
          </Tooltip>
          <Tooltip title="Edit agent">
            <Button
              type="text"
              icon={<Settings size={18} />}
              onClick={handleEditClick}
              className="action-button"
            />
          </Tooltip>

          <Tooltip title="Delete agent">
            <Button
              type="text"
              icon={<Trash size={18} />}
              onClick={showDeleteModal}
              className="action-button delete-button"
            />
          </Tooltip>
        </div>
      </Card>

      {/* Agent Edit Modal */}
      <AgentModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSubmit={handleEditSubmit}
        key={id}
        defaultValue={{
          agentConfig: agentData?.data?.agentConfig,
          mcpServers: agentData?.data?.mcpServers,
        }}
        modalTitle={`Edit Agent - ${name}`}
        loading={agentDataLoading}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Trash size={18} color="red" style={{ marginRight: "10px" }} />
            <span>Are you sure you want to delete this agent?</span>
          </div>
        }
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>
          Deleting this agent will permanently remove it along with all
          associated data, including chat history. This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default AgentCard;
