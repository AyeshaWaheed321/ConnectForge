import React from 'react';
import { 
  GitBranch, 
  MessageSquare, 
  Bell, 
  Settings, 
  Mic 
} from 'lucide-react';

const ActivityOverview: React.FC = () => {
  const activities = [
    {
      id: 1,
      title: 'Created new agent: GitHub PR Agent',
      meta: 'GitHub PR Agent',
      time: '10:17 AM',
      icon: <GitBranch size={16} />,
    },
    {
      id: 2,
      title: 'Sent message to user regarding PR #123',
      meta: 'GitHub PR Agent',
      time: '09:47 AM',
      icon: <MessageSquare size={16} />,
    },
    {
      id: 3,
      title: 'Used Slack API to send notification',
      meta: 'Slack Notifier',
      time: '08:22 AM',
      icon: <Bell size={16} />,
    },
    {
      id: 4,
      title: 'Updated configuration for Jira Ticket Manager',
      meta: 'Jira Ticket Manager',
      time: '07:22 AM',
      icon: <Settings size={16} />,
    },
    {
      id: 5,
      title: 'Registered new tool: Speech Recognition API',
      meta: 'Speech Recognition',
      time: 'May 7',
      icon: <Mic size={16} />,
    },
  ];

  return (
    <div className="activity-overview">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-content">
              <div className="activity-main">
                <div className="activity-title">
                  <span className="activity-icon">{activity.icon}</span>
                  {activity.title}
                </div>
                <p className="activity-meta">{activity.meta}</p>
              </div>
              <span className="activity-time">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityOverview;