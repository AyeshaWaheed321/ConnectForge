import React, { useState } from "react";
import { Input, Button, message } from "antd";
import { Send, Mic, ArrowLeft } from "lucide-react";
import "./chat.scss";

// Constants
import URLS from "../../constants/UrlConstants";
import { REDUX_STATES } from "../../constants/ReduxStates";

// component
import Loading from "../common/Loader";

// Redux
import useAppDispatch from "../../hooks/useAppDispatch";
import { useSelector } from "react-redux";

// Actions
import { postAction } from "../../store/actions/crudActions";

const { AGENT_CHAT, LOADING } = REDUX_STATES || {};
interface Message {
  id: number;
  text: string;
  sender: string;
  // timestamp: string;
}

interface ChatProps {
  chatMode: string;
  onBack: () => void;
}

const Chat: React.FC<ChatProps> = ({ onBack, chatMode }) => {
  // redux
  const dispatch = useAppDispatch();
  const [messages, setMessages] = useState<Message[]>([
    // {
    //   id: 1,
    //   text: 'I found 3 open pull requests. The latest one is #123 "Add user authentication feature" by JohnDoe.\n\nChanges include:\n- New user authentication API endpoints\n- Password hashing implementation\n- JWT token generation\n\nThere are 2 review comments requesting changes to the token expiration logic.',
    //   sender: 'GitHub PR Agent',
    //   timestamp: 'Just now'
    // }
  ]);
  const [inputValue, setInputValue] = useState("");

    // Redux States
    const {
      [AGENT_CHAT + LOADING]: chatLoading = false
    } = useSelector((state: any) => state?.crud);

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: inputValue,
          sender: "You",
        },
      ]);
      sendToAgent(inputValue);
    }
  };

  const sendToAgent = (val: string) => {
    const payload = {
      message: val,
      agent_id: chatMode,
    };
    dispatch(postAction(URLS.AGENT_CHAT, payload, null, AGENT_CHAT)).then(
      (res: any) => {
        const response = res?.data?.response;
         setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: response,
          sender: "Agent",
        },
      ]);
        setInputValue("");
      },
      (error: any) => {
        message.error("Error in sending message.");
        console.error("Error creating agent:", error);
      }
    );
  };

  return (
    <div className="chat-screen">
      <div className="chat-header-bar">
        <Button icon={<ArrowLeft size={16} />} onClick={onBack}>
          Back to Agents
        </Button>
        <h1>Chat with your Agents</h1>
        <Button
          type="primary"
          icon={<Mic size={16} />}
          className="voice-command"
        >
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
                </div>
              </div>
            </div>
          ))}
        </div>
        {!!chatLoading && <Loading />}
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
