import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

function SimpleApp() {
  return (
    <div style={{
      padding: '50px',
      fontSize: '24px',
      backgroundColor: '#e6ffe6',
      border: '3px solid green',
      color: 'black'
    }}>
      <h1 style={{ color: 'green' }}>✅ SIMPLE REACT APP WORKING!</h1>
      <p>React is mounting successfully.</p>
      <p>Time: {new Date().toLocaleString()}</p>
    </div>
  );
}

console.log('SimpleMain.tsx - Starting React app...')

const rootElement = document.getElementById('root')
if (rootElement) {
  console.log('SimpleMain.tsx - Root element found, creating React app...')
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <SimpleApp />
    </StrictMode>
  )
  console.log('SimpleMain.tsx - React app rendered successfully!')
} else {
  console.error('SimpleMain.tsx - Root element not found!')
}