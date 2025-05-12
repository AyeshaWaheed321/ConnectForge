// Chat.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Button, message as AntMessage } from "antd";
import { Send, Mic, ArrowLeft } from "lucide-react";
import "./chat.scss";

// Constants
import URLS from "../../constants/UrlConstants";
import { REDUX_STATES } from "../../constants/ReduxStates";

// Component
import Loading from "../common/Loader";

// Redux
import useAppDispatch from "../../hooks/useAppDispatch";
import { useSelector } from "react-redux";

// Actions
import { postAction, getAction } from "../../store/actions/crudActions";

const { AGENT_CHAT, LOADING, AGENT_CHAT_HISTORY } = REDUX_STATES || {};

interface Message {
  id: number;
  text: string;
  role: "You" | "Agent";
}

const Chat: React.FC = () => {
  const { agentId } = useParams(); // Get agent_id from route parameter
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { [AGENT_CHAT_HISTORY + LOADING]: chatLoading = false } = useSelector(
    (state: any) => state?.crud
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const mapRole = (role: string): "You" | "Agent" =>
    role === "ai" ? "Agent" : "You";

  useEffect(() => {
    if (agentId) {
      fetchChatHistory(page);
    }
  }, [agentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = (pageNum: number) => {
    const queryParams = {
      agent_id: agentId,
      page: pageNum,
      page_size: 20,
    };

    dispatch(
      getAction(
        URLS.AGENT_CHAT_HISTORY,
        { params: queryParams },
        AGENT_CHAT_HISTORY
      )
    ).then(
      (res: any) => {
        const historyMessages: Message[] =
          res?.data?.results?.map((msg: any) => ({
            id: msg.id,
            text: msg.message,
            role: mapRole(msg.role),
          })) || [];

        setMessages(historyMessages);
      },
      (error: any) => {
        console.error("Error fetching history:", error);
        AntMessage.error("Failed to load chat history.");
      }
    );
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      const humanMessage: Message = {
        id: messages.length + 1,
        text: inputValue,
        role: "You",
      };
      setMessages((prev) => [...prev, humanMessage]);
      sendToAI(inputValue);
    }
  };

  const sendToAI = (val: string) => {
    const payload = {
      message: val,
      agent_id: agentId,
    };

    dispatch(postAction(URLS.AGENT_CHAT, payload, null, AGENT_CHAT)).then(
      (res: any) => {
        const response = res?.data?.response;

        const aiMessage: Message = {
          id: messages.length + 2,
          text: response,
          role: "Agent",
        };

        setMessages((prev) => [...prev, aiMessage]);
        setInputValue("");
      },
      (error: any) => {
        AntMessage.error("Error sending message.");
        console.error("Send error:", error);
      }
    );
  };

  return (
    <div className="chat-screen">
      <div className="chat-header-bar">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
          Back to Agents
        </Button>
        <h1>Chat with your Agent</h1>
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
              <div className={`message-content ${message.role.toLowerCase()}`}>
                <p className="message-text">{message.text}</p>
                <div className="message-meta">
                  <span className="role">{message.role}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
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
