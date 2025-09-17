import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', fontSize: '18px', color: 'blue' }}>
      <h1>🎉 TEST APP IS WORKING!</h1>
      <p>React is mounting correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}

export default TestApp;