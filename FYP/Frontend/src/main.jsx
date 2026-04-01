import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Entry point of the React application that renders the App component inside a StrictMode wrapper for highlighting potential issues in development mode. The createRoot API from React 18 is used to enable concurrent features and improve performance.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
