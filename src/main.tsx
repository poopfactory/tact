import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// StrictMode is applied per-route in App.tsx instead of wrapping the whole
// tree here — the /studio route embeds a prototype whose AudioEngine and
// camera stream are non-idempotent browser resources, and StrictMode's
// dev-only double-invoked effects permanently dispose them on first mount.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
