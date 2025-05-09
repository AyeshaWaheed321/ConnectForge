import React from 'react';

interface ProgressBarProps {
  value: number;
  type: 'cpu' | 'memory' | 'network';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, type }) => {
  return (
    <div className="progress-bar">
      <div 
        className={`progress-fill ${type}`} 
        style={{ width: `${value}%` }} 
      />
    </div>
  );
};

export default ProgressBar;