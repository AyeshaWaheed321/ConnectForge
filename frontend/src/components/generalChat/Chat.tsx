import React, { useState } from 'react';
import { Button, Input, List, Typography } from 'antd';
import { ArrowLeft, Mic, Send } from 'lucide-react';
import { Card } from '../common/card';
import './Chat.css';

const { TextArea } = Input;
const { Title } = Typography;

interface ChatProps {
//   onBack: () => void;
}

interface Message {
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface ChatOption {
  id: string;
  title: string;
  description: string;
}

const Chat: React.FC<ChatProps> = ({  }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Chat options to be displayed
  const chatOptions: ChatOption[] = [
    {
      id: 'jira-tickets',
      title: 'Create Jira tickets from GitHub issues',
      description: 'Automatically convert GitHub issues into well-structured Jira tickets with assigned labels, priorities, and owners.'
    },
    {
      id: 'sprint-workload',
      title: 'Plan sprint workload distribution',
      description: 'Calculate optimal task allocation based on sprint velocity and developer capacity and availability.'
    },
    {
      id: 'weekly-progress',
      title: 'Generate weekly progress summary',
      description: 'Create executive-level reports summarizing sprint goals, completed tasks, carry-overs, and blockers by team or project.'
    },
    {
      id: 'at-risk-issues',
      title: 'Identify and flag at-risk issues',
      description: 'Automatically detect issues that are overdue, inactive, or stuck based on status, comments, and time in progress.'
    },
    {
      id: 'link-code',
      title: 'Link code to Jira issues',
      description: 'Validate code-to-ticket mapping by ensuring commit messages include proper issue keys and follow project conventions.'
    },
    {
      id: 'qa-tasks',
      title: 'Auto-generate test and QA tasks',
      description: 'Create QA and testing tickets automatically based on completed development tasks or pull request merges.'
    }
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const newUserMessage: Message = {
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages([...messages, newUserMessage]);
    setInputValue('');
    
    // Simulate agent response after a short delay
    setTimeout(() => {
      const agentMessage: Message = {
        content: `This is a simulated response to: "${inputValue}"`,
        sender: 'agent',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOptionClick = (option: ChatOption) => {
    // Add message based on the selected option
    const newUserMessage: Message = {
      content: `I'd like to ${option.title.toLowerCase()}`,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages([...messages, newUserMessage]);
    
    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        content: `I'll help you ${option.title.toLowerCase()}. Let me gather the necessary information.`,
        sender: 'agent',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <Button 
          type="text" 
          icon={<ArrowLeft size={16} />} 
          onClick={() => setMessages([])} // Reset messages on back
          className="back-button"
        >
          Back
        </Button>
        <Title level={4} className="chat-title">Chat with GitHub Agent</Title>
        <Button
          type="primary"
          icon={<Mic size={16} />}
          className="voice-command-button"
        >
          Voice Command
        </Button>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-options-container">
            <h3 className="options-title">
              <span className="options-icon">✦</span> Explore these options
            </h3>
            
            <div className="options-grid">
              {chatOptions.map((option) => (
                <Card 
                  key={option.id} 
                  className="option-card"
                  onClick={() => handleOptionClick(option)}
                >
                  <h4>{option.title}</h4>
                  <p>{option.description}</p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <List
            dataSource={messages}
            renderItem={(message) => (
              <List.Item className={`message ${message.sender}`}>
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
      
      <div className="chat-input-container">
        <TextArea 
          placeholder="Type your message..." 
          autoSize={{ minRows: 1, maxRows: 4 }}
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button 
          type="primary" 
          onClick={handleSendMessage}
          icon={<Send size={16} />}
          className="send-button"
        />
      </div>
    </div>
  );
};

export default Chat;