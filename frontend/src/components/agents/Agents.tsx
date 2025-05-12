import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import { MessageSquare, Trash2, Pause, Play, ArrowLeft } from "lucide-react";
import "./agents.scss";

// Components
import Chat from "../chat/Chat";
import AgentModal from "./AddAgentModal";
import AgentCard from "./AgentCard";
import Loading from "../common/Loader";

// Constants
import URLS from "../../constants/UrlConstants";
import { REDUX_STATES } from "../../constants/ReduxStates";

// Redux
import useAppDispatch from "../../hooks/useAppDispatch";
import { useSelector } from "react-redux";

// Actions
import {
  getAction,
  postAction,
  deleteAction,
} from "../../store/actions/crudActions";

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

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatMode, setChatMode] = useState(""); // track chat screen

  type AgentStatus = "Connected" | "Not Connected";

  const getAgentList = () => {
    dispatch(getAction(URLS.AGENTS, {}, AGENTS));
  };

  useEffect(() => {
    !agentsListLoading && getAgentList();
  }, []);

  interface Agent {
    id: string;
    agent_name: string;
    // provider: string;
    description: string;
    status: AgentStatus;
    tool_names: string[];
  }

  const handleSubmit = (values: any) => {
    dispatch(postAction(URLS.AGENTS, values, null, AGENTS)).then(
      () => {
        message.success("Agent is created successfully");
        getAgentList();
        setIsModalOpen(false);
      },
      (error: any) => {
        setIsModalOpen(false);
        message.error("Error creating agent. Please try again.");
        console.error("Error creating agent:", error);
      }
    );
  };

  const handleDelete = (id: string) => {
    dispatch(
      deleteAction(URLS.DELETE_AGENT.replace(":id", id), null, null, AGENTS)
    ).then(
      () => {
        message.success("Agent is deleted successfully");
        getAgentList();
      },
      (error: any) => {
        message.error("Error in deleting agent. Please try again.");
      }
    );
  };

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
        {!!agentsList?.data &&
          agentsList?.data?.map((agent: Agent) => (
            <AgentCard
              id={agent.id}
              key={agent.id}
              name={agent.agent_name}
              // provider={agent.provider}
              description={agent.description}
              status={"Connected"}
              tags={agent.tool_names}
              handleDelete={handleDelete}
            />
          ))}
      </div>

      <AgentModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data: any) => handleSubmit(data)}
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
