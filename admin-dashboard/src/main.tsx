import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 应用开始加载...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('找不到 #root 元素！');
  }
  
  console.log('✓ 找到 root 元素');
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('✓ React 应用已渲染');
} catch (error) {
  console.error('❌ 应用加载失败:', error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: system-ui; color: red;">
        <h1>应用加载失败</h1>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
        <pre>${error instanceof Error ? error.stack : ''}</pre>
      </div>
    `;
  }
}
