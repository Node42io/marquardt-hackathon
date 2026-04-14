import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Report design system — must come before Tailwind so Tailwind utilities can override when needed
import './assets/report.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
