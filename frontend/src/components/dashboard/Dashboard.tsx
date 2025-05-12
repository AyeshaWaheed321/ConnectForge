import React, { useEffect } from "react";
import { Row, Col } from "antd";
import "./dashboard.scss";

// Components
import StatusCard from "./StatusCard";
import ActivityOverview from "./ActivityOverview";

// Redux
import useAppDispatch from "../../hooks/useAppDispatch";
import { useSelector } from "react-redux";

// Actions
import { getAction } from "../../store/actions/crudActions";
import URLS from "../../constants/UrlConstants"; // make sure URLS.DASHBOARD points to "/api/dashboard"

// Localization
import LOCALIZATION from "../../services/LocalizationService";
import { REDUX_STATES } from "../../constants/ReduxStates";

const { METRICS, RESPONSE } = REDUX_STATES || {};

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const { [METRICS + RESPONSE]: dashboardData = {} } = useSelector(
    (state: any) => state?.crud || {}
  );

  useEffect(() => {
    dispatch(getAction(URLS.DASHBOARD_ANALYTICS, {}, METRICS));
  }, [dispatch]);

  const {
    total_agents = 0,
    total_success = 0,
    total_failures = 0,
    average_response_time = 0,
  } = dashboardData?.data || {};

  return (
    <div className="dashboard">
      <h1>{LOCALIZATION.DASHBOARD}</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatusCard
            title="Total Agents"
            value={total_agents}
            percentage={0} // Replace with dynamic value if needed
            type="primary"
            icon="users"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatusCard
            title="Avg. Response Time"
            value={`${average_response_time.toFixed(1)} ms`}
            percentage={0}
            type="info"
            icon="hammer"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatusCard
            title="Successful Tasks"
            value={total_success.toString()}
            percentage={0}
            type="success"
            icon="check"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatusCard
            title="Failed Tasks"
            value={total_failures.toString()}
            percentage={0}
            type="error"
            icon="x"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="dashboard-sections">
        <Col xs={24} lg={24}>
          <h2 className="section-title">{LOCALIZATION.ACTIVITY_OVERVIEW}</h2>
          <ActivityOverview />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
