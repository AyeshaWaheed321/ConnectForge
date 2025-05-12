import React from "react";
import { Card } from "antd";
import { Users, Hammer, Check, X } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string;
  percentage: number;
  type: "primary" | "success" | "error" | "info";
  icon: string;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  percentage,
  type,
  icon,
}) => {
  const renderIcon = () => {
    switch (icon) {
      case "users":
        return <Users size={18} />;
      case "hammer":
        return <Hammer size={18} />;
      case "check":
        return <Check size={18} />;
      case "x":
        return <X size={18} />;
      default:
        return null;
    }
  };

  return (
    <Card className={`status-card ${type}`}>
      <div className="status-card-header">
        <h3 className="status-card-title">{title}</h3>
        <div className={`status-card-icon ${type}`}>{renderIcon()}</div>
      </div>
      <h2 className="status-card-value">{value}</h2>
    </Card>
  );
};

export default StatusCard;
