import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// 첫 렌더 전에 언어를 정한다(동기 초기화).
import '@/lib/i18n'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
