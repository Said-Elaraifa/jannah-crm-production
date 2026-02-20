import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'


// Diagnostic Layer: Logs directly to the UI before React starts
const bootLog = (msg) => {
  const logDiv = document.getElementById('boot-logs') || (() => {
    const d = document.createElement('div');
    d.id = 'boot-logs';
    d.style.cssText = 'position:fixed;bottom:10px;left:10px;font-size:10px;color:#c3dc7f;z-index:999999;font-family:monospace;pointer-events:none;opacity:0.5;';
    document.body.appendChild(d);
    return d;
  })();
  logDiv.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
  console.log(`[BOOT] ${msg}`);
};

bootLog("Moteur Jannah OS en cours d'allumage...");

// Universal Error Catcher
window.onerror = function (msg, url, line, col, error) {
  const errMsg = `SYSTEM CRASH: ${msg} (${line}:${col})`;
  bootLog(`<span style="color:red;font-weight:bold">${errMsg}</span>`);

  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;inset:0;background:#070c12;color:white;padding:40px;z-index:9999999;font-family:monospace;overflow:auto;';
  div.innerHTML = `
    <div style="max-width:800px;margin:0 auto;border:2px solid #ff4444;padding:30px;border-radius:20px;background:#1a0000;">
      <h1 style="color:#ff4444;margin-top:0;">🛑 ERREUR CRITIQUE SYSTEME</h1>
      <p style="font-size:18px;font-weight:bold;margin:20px 0;">${msg}</p>
      <div style="background:rgba(0,0,0,0.5);padding:20px;border-radius:10px;font-size:12px;color:#aaa;">
        <div>Fichier : ${url}</div>
        <div>Ligne : ${line}:${col}</div>
        <hr style="margin:15px 0;opacity:0.1" />
        <pre style="white-space:pre-wrap">${error?.stack || 'Pas de pile d\'exécution disponible'}</pre>
      </div>
      <button onclick="window.location.reload()" style="margin-top:30px;padding:15px 30px;background:#c3dc7f;color:#12202c;border:none;border-radius:10px;font-weight:bold;cursor:pointer">REDÉMARRER LE SYSTÈME</button>
    </div>
  `;
  document.body.appendChild(div);
  return false;
};

bootLog("Chargement des composants React...");

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("Élément #root introuvable dans le DOM");

  const root = createRoot(rootElement);
  bootLog("Montage de l'application...");

  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );

  bootLog("Interface déployée.");
} catch (e) {
  bootLog(`ERREUR DE MONTAGE: ${e.message}`);
  console.error("Mount Error:", e);
}
