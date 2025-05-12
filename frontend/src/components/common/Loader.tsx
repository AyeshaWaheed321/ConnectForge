/* 
  Main loader for whole application
*/

import React from 'react';

// Antd
import { Spin } from 'antd';

function Loading() {
  return (
    <div className="app-loader">
      <Spin size="large" />
    </div>
  );
}

export default Loading;