import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'


// Diagnostic hook: signal that the main bundle has executed
if (window.JANNAH_LOG) window.JANNAH_LOG('[Étape 3] Noyau JS en cours de démarrage...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("Élément #root introuvable");

  const root = createRoot(rootElement);

  if (window.JANNAH_LOG) window.JANNAH_LOG('[Étape 4] Montage de l\'interface...');

  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );

  // Hide boot status after a short delay if everything seems okay
  setTimeout(() => {
    const bootStatus = document.getElementById('boot-status');
    if (bootStatus) bootStatus.style.display = 'none';
    if (window.JANNAH_LOG) window.JANNAH_LOG('[OK] Système opérationnel.');
  }, 1000);

} catch (e) {
  if (window.JANNAH_LOG) window.JANNAH_LOG('❌ ERREUR DE MONTAGE : ' + e.message);
  console.error("Mount Error:", e);
}
