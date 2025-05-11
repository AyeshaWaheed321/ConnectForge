import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Card, Tag, Tooltip } from "antd";
import { MessageSquare, Trash2, Pause, Play, ArrowLeft } from "lucide-react";
import "./agents.scss";

// Components
import Chat from "../chat/Chat";
import AgentModal from "./AddAgentModal";
import AgentCard from "./AgentCard";
import Loading from "../common/Loader";

// Constants
import URLS from "../../constants/URLConstants";
import { REDUX_STATES } from "../../constants/ReduxStates";

// Redux
import useAppDispatch from "../../hooks/useAppDispatch";
import { useSelector } from "react-redux";

// Actions
import { getAction } from "../../store/actions/crudActions";

// Localization
import LOCALIZATION from "../../services/LocalizationService";

const { AGENTS, RESPONSE, LOADING, ERROR } = REDUX_STATES || {};

const Agents: React.FC = () => {
  const dispatch = useAppDispatch();

  // Redux States
  const {
    [AGENTS + RESPONSE]: agentsList = {},
    [AGENTS + LOADING]: agentsListLoading = false,
    [AGENTS + ERROR]: agentsListError = false,
  } = useSelector((state: any) => state?.crud);

  console.log("agentsList", agentsList);
  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatMode, setChatMode] = useState(false); // track chat screen

  type AgentStatus = "Connected" | "Not Connected";

  const getAgentList = () => {
    dispatch(getAction(URLS.GET_AGENTS, {}, AGENTS));
  };

  useEffect(() => {
    !agentsListLoading && getAgentList();
  }, [agentsList]);

  interface Agent {
    id: number;
    name: string;
    provider: string;
    description: string;
    status: AgentStatus;
    tags: string[];
  }

  const agents: Agent[] = [
    {
      id: 1,
      name: "GitHub Agent",
      provider: "github",
      description:
        "Monitors GitHub pull requests and provides summaries and analysis",
      status: "Connected",
      tags: ["github", "analyze", "summarize"],
    },
    {
      id: 2,
      name: "Slack Notifier",
      provider: "slack",
      description: "Sends notifications to Slack channels based on events",
      status: "Connected",
      tags: ["slack"],
    },
    {
      id: 3,
      name: "Jira Ticket Manager",
      provider: "jira",
      description:
        "Creates and updates Jira tickets based on natural language requests",
      status: "Not Connected",
      tags: ["jira"],
    },
  ];

  const handleSubmit = (values: any) => {
    console.log("Form values:", values);
    setIsModalOpen(false);
  };

  if (chatMode) {
    return <Chat onBack={() => setChatMode(false)} />;
  }

  return (
    <div className="agents-screen">
      {!!agentsListLoading && <Loading />}
      <div className="agents-header">
        <h1>{LOCALIZATION.AGENTS}</h1>
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          className="configure-button"
        >
          {LOCALIZATION.ADD_AGENT}
        </Button>
      </div>

      <div className="agents-grid">
        {agents.map((agent) => (
          <AgentCard
            id={agent.id}
            name={agent.name}
            provider={agent.provider}
            description={agent.description}
            status={agent.status}
            tags={agent.tags}
            setChatMode={setChatMode}
          />
        ))}
      </div>

      <AgentModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => {}}
      />

      {agentsListError && (
        <div className="error-message">
          <p>
            Failed to load agents. Please check your network or try again later.
          </p>
        </div>
      )}
    </div>
  );
};

export default Agents;
