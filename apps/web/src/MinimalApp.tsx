import React from 'react';

function MinimalApp() {
  console.log('MinimalApp is rendering!');

  return (
    <div style={{
      padding: '50px',
      fontSize: '24px',
      backgroundColor: '#f0f0f0',
      border: '3px solid red',
      color: 'black'
    }}>
      <h1 style={{ color: 'red' }}>🚀 MINIMAL APP WORKING!</h1>
      <p>If you see this, React is working.</p>
      <p>Time: {new Date().toLocaleString()}</p>
      <button onClick={() => alert('Button clicked!')}>
        Test Button
      </button>
    </div>
  );
}

export default MinimalApp;