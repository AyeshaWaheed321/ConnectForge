import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import "./agents.scss";

// Components
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

  type AgentStatus = "Connected" | "Not Connected";

  const getAgentList = () => {
    return dispatch(getAction(URLS.AGENTS, {}, AGENTS));
  };

  useEffect(() => {
    if (!agentsListLoading && !agentsList?.data) {
      getAgentList();
    }
  }, []);

  interface Agent {
    id: string;
    agent_name: string;
    description: string;
    status: AgentStatus;
    tool_names: string[];
  }

  const handleSubmit = (values: any) => {
    dispatch(postAction(URLS.AGENTS, values, null, AGENTS)).then(
      () => {
        message.success("Agent is created successfully");
        getAgentList().then(() => {
          setIsModalOpen(false);
        });
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
      deleteAction(URLS.AGENT_BY_ID.replace(":id", id), null, null, AGENTS)
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
      {agentsListLoading && <Loading />}

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
        {Array.isArray(agentsList?.data) && agentsList.data.length > 0 ? (
          agentsList.data.map((agent: Agent) => (
            <AgentCard
              id={agent.id}
              key={agent.id}
              name={agent.agent_name}
              description={agent.description}
              status="Connected"
              tags={agent.tool_names}
              handleDelete={handleDelete}
            />
          ))
        ) : !agentsListLoading ? (
          <p className="empty-state">No agents available.</p>
        ) : null}
      </div>

      <AgentModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
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
