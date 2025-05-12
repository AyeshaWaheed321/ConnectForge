import React, { useState, Dispatch, SetStateAction } from "react";
import { Card, Button, Tooltip, Modal } from "antd";
import { MessageCircle, Settings, Trash, Pause, Play } from "lucide-react";
import AgentConfigModal, { AgentConfigFormValues } from "./AgentConfigModal";
import "./AgentCard.css";
import { useNavigate } from "react-router-dom"; // Import for navigation

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

export const AgentCard: React.FC<AgentProps> = ({
  id,
  name,
  description,
  status,
  tags,
  handleDelete,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // State for delete confirmation
  const navigate = useNavigate(); // Initialize navigation

  const handleSubmitAgent = (agentData: any) => {
    console.log("Updated agent data:", agentData);
    setModalVisible(false);
  };

  const handleSubmitConfig = (values: AgentConfigFormValues) => {
    console.log("Config values:", values);
    setConfigModalVisible(false);
  };

  const remainingCount = tags.length - visibleTagCount;

  const handleChatClick = () => {
    navigate(`/chat/${id}`); // Navigate to chat route with agent ID
  };

  const showDeleteModal = () => {
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    handleDelete(id);
    setDeleteModalVisible(false); // Close modal after deletion
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false); // Close modal if user cancels
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

        {/* Tools Heading */}
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
          {status === "Connected" ? (
            <Tooltip title="Pause agent">
              <Button
                type="text"
                icon={<Pause size={18} />}
                className="action-button"
              />
            </Tooltip>
          ) : (
            <Tooltip title="Start agent">
              <Button
                type="text"
                icon={<Play size={18} />}
                className="action-button"
              />
            </Tooltip>
          )}
          <Tooltip title="Chat with agent">
            <Button
              type="text"
              icon={<MessageCircle size={18} />}
              onClick={handleChatClick}
              className="action-button"
            />
          </Tooltip>
          <Tooltip title="Delete agent">
            <Button
              type="text"
              icon={<Trash size={18} />}
              onClick={showDeleteModal} // Show delete confirmation on click
              className="action-button delete-button"
            />
          </Tooltip>
        </div>
      </Card>

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
        okButtonProps={{
          danger: true,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <p>
            Deleting this agent will permanently remove it along with all
            associated data, including chat history. This action cannot be
            undone.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default AgentCard;
