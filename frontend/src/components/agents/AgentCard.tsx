import React, { useState,  Dispatch, SetStateAction } from 'react';
import { Card, Button, Tooltip } from 'antd';
import { MessageCircle, Settings, Trash, Pause, Play } from 'lucide-react';
import AgentConfigModal, { AgentConfigFormValues } from './AgentConfigModal';
import './AgentCard.css';

export interface AgentProps {
  id: number;
  name: string;
  provider: string;
  description: string;
  status: 'Connected' | 'Not Connected';
  tags: string[];
  setChatMode: Dispatch<SetStateAction<boolean>>;
}

export const AgentCard: React.FC<AgentProps> = ({ id, name, provider, description, status, tags, setChatMode }) => {
  const [modalVisible, setModalVisible] = useState(false);
   const [configModalVisible, setConfigModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSubmitAgent = (agentData: any) => {
    console.log('Updated agent data:', agentData);
    setModalVisible(false);
  };

    const handleOpenConfigModal = () => {
        setConfigModalVisible(true);
    };

    const handleCloseConfigModal = () => {
        setConfigModalVisible(false);
    };

    const handleSubmitConfig = (values: AgentConfigFormValues) => {
        console.log('Config values:', values);
        setConfigModalVisible(false);
    };

//   if (chatMode) {
//     return <Chat onBack={() => setChatMode(false)} />;
//   }


  return (
    <Card className="agent-card">
      <div className="agent-header">
        <h3 className="agent-name">{name}</h3>
        <span className={`status-badge ${status === 'Connected' ? 'connected' : 'disconnected'}`}>
          {status}
        </span>
      </div>
      
      <p className="agent-provider">{provider}</p>
      <p className="agent-description">{description}</p>
      
      <div className="agent-tags">
        {tags.map((tag) => (
          <span key={tag} className="agent-tag">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="agent-actions">
        {status === 'Connected' ? (
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
            onClick={() => setChatMode(true)}
            className="action-button"
          />
        </Tooltip>
        <Tooltip title="Agent settings">
          <Button 
            type="text" 
            icon={<Settings size={18} />} 
            onClick={handleOpenConfigModal}
            className="action-button"
          />
        </Tooltip>
        <Tooltip title="Delete agent">
          <Button 
            type="text" 
            icon={<Trash size={18} />} 
            className="action-button delete-button"
          />
        </Tooltip>
      </div>

<AgentConfigModal
        visible={configModalVisible}
        onClose={handleCloseConfigModal}
        onSubmit={handleSubmitConfig}
      />
      {/* <AgentModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmitAgent}
      /> */}
    </Card>
  );
};

export default AgentCard;