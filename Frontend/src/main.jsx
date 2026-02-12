import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AppContextProvider from './context/AppContext'
import { PlatformSettingsProvider } from './context/PlatformSettingsContext'
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'leaflet/dist/leaflet.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <PlatformSettingsProvider>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </PlatformSettingsProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>,
)
