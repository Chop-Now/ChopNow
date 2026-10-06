import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import AppContextProvider from './context/AppContext';
import { PlatformSettingsProvider } from './context/PlatformSettingsContext';
import ErrorBoundary from './Components/ErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';
import 'leaflet/dist/leaflet.css';
import './utils/singleErrorToast';
import { installErrorReporting } from './utils/reportError';

installErrorReporting();

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <BrowserRouter>
      <ErrorBoundary>
        <PlatformSettingsProvider>
          <AppContextProvider>
            <App />
          </AppContextProvider>
        </PlatformSettingsProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </HelmetProvider>
);

// Installable app + offline page. Production only: a service worker in dev
// would cache stale modules from the Vite server.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
