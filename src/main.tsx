import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Analytics } from "@vercel/analytics/react"

import './index.css'

// 防止移动设备上的意外滚动
const preventDefaultTouch = (e: TouchEvent) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
};

document.addEventListener('touchstart', preventDefaultTouch, { passive: false });
document.addEventListener('touchmove', preventDefaultTouch, { passive: false });

// 渲染应用
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Analytics/>
    <App />
  </React.StrictMode>,
)