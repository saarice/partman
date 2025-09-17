import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MinimalApp from './MinimalApp'

console.log('main.tsx is loading...')

const rootElement = document.getElementById('root')
console.log('Root element:', rootElement)

if (rootElement) {
  console.log('Creating React root...')
  const root = createRoot(rootElement)

  console.log('Rendering app...')
  root.render(
    <StrictMode>
      <MinimalApp />
    </StrictMode>
  )
  console.log('App rendered!')
} else {
  console.error('Root element not found!')
}