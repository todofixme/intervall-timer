import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Latin subset only: covers German, keeps the precache small.
import '@fontsource/big-shoulders-display/latin-800'
import '@fontsource/instrument-sans/latin-400'
import '@fontsource/instrument-sans/latin-600'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
