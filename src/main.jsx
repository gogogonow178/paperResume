import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
import App from './App.jsx'
import './index.css'

// Polyfill Buffer for @react-pdf/renderer
window.Buffer = Buffer

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
