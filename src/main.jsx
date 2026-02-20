import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'


// Traceur d'erreurs global pour Netlify
window.onerror = function (msg, url, line, col, error) {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.width = '100%';
  div.style.height = '100%';
  div.style.background = 'red';
  div.style.color = 'white';
  div.style.padding = '20px';
  div.style.zIndex = '999999';
  div.style.fontFamily = 'monospace';
  div.innerHTML = `<h1>CRITICAL ERROR:</h1><p>${msg}</p><p>Line: ${line}:${col}</p><p>File: ${url}</p><pre>${error?.stack || 'No stack'}</pre>`;
  document.body.appendChild(div);
  return false;
};

try {
  createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} catch (e) {
  console.error("Mount Error:", e);
  document.body.innerHTML = `<div style="color:white;padding:50px;">Mount Failure: ${e.message}</div>`;
}
