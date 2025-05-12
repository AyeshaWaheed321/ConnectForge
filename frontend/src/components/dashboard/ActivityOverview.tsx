import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Plus,
  Trash2,
  Settings2,
  MessageCircle,
  MicOff,
  AlertTriangle,
  User2,
} from "lucide-react";
import useAppDispatch from "../../hooks/useAppDispatch";
import { getAction } from "../../store/actions/crudActions";
import URLS from "../../constants/UrlConstants";
import dayjs from "dayjs";
import "./dashboard.scss";
import { REDUX_STATES } from "../../constants/ReduxStates";

const iconMap: Record<string, JSX.Element> = {
  agent_created: <Plus size={16} />,
  agent_deleted: <Trash2 size={16} />,
  agent_modified: <Settings2 size={16} />,
  chat_started: <MessageCircle size={16} />,
  chat_ended: <MicOff size={16} />,
  chat_deleted: <Trash2 size={16} />,
  error_occurred: <AlertTriangle size={16} />,
  default: <User2 size={16} />,
};

const tagColorMap: Record<string, string> = {
  agent_created: "success",
  agent_deleted: "error",
  agent_modified: "warning",
  chat_started: "info",
  chat_ended: "muted",
  chat_deleted: "error",
  error_occurred: "error",
  default: "muted",
};

const { DASHBOARD_LOGS, RESPONSE } = REDUX_STATES || {};

const ActivityOverview: React.FC = () => {
  const dispatch = useAppDispatch();
  const { [DASHBOARD_LOGS + RESPONSE]: logsData = {} } = useSelector(
    (state: any) => state.crud || {}
  );
  const logs = logsData?.data?.results || [];

  useEffect(() => {
    dispatch(
      getAction(`${URLS.DASHBOARD_LOGS}?page_size=20`, {}, DASHBOARD_LOGS)
    );
  }, [dispatch]);

  return (
    <div className="activity-overview">
      <div className="activity-list">
        {logs.map((log: any) => {
          const icon = iconMap[log.action] || iconMap.default;
          const tagClass = tagColorMap[log.action] || "muted";
          const time = dayjs(log.timestamp).format("hh:mm A");

          return (
            <div key={log.id} className="activity-item">
              <div className={`activity-tag tag--${tagClass}`}>
                {log.action.replace(/_/g, " ")}
              </div>
              <div className="activity-content">
                <div className="activity-main">
                  <div className="activity-title">
                    <span className="activity-icon">{icon}</span>
                    {log.description}
                  </div>
                  <div className="activity-meta-row">
                    <p className="activity-meta">
                      {log.agent || "System Event"}
                    </p>
                    <span className="activity-timestamp">
                      {dayjs(log.timestamp).format("MMMM D, YYYY - hh:mm A")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {logs.length === 0 && <p>No recent activity found.</p>}
      </div>
    </div>
  );
};

export default ActivityOverview;
