import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { Send, Mic, ArrowLeft } from 'lucide-react';
import './chat.scss';

interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
}

interface ChatProps {
  onBack: () => void;
}

const Chat: React.FC<ChatProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'I found 3 open pull requests. The latest one is #123 "Add user authentication feature" by JohnDoe.\n\nChanges include:\n- New user authentication API endpoints\n- Password hashing implementation\n- JWT token generation\n\nThere are 2 review comments requesting changes to the token expiration logic.',
      sender: 'GitHub PR Agent',
      timestamp: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: inputValue,
          sender: 'You',
          timestamp: 'Just now'
        }
      ]);
      setInputValue('');
    }
  };

  return (
    <div className="chat-screen">
      <div className="chat-header-bar">
        <Button icon={<ArrowLeft size={16} />} onClick={onBack}>
          Back to Agents
        </Button>
        <h1>Chat with your Agents</h1>
        <Button type="primary" icon={<Mic size={16} />} className="voice-command">
          Voice Command
        </Button>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((message) => (
            <div key={message.id} className="message">
              <div className="message-content">
                <p className="message-text">{message.text}</p>
                <div className="message-meta">
                  <span className="sender">{message.sender}</span>
                  <span className="timestamp">{message.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSend}
          />
          <Button
            type="primary"
            icon={<Send size={16} />}
            onClick={handleSend}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
