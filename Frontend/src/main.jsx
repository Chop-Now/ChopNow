import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import './config/i18n'; // Import i18n config
import { AuthProvider } from './context/AuthContext.jsx'
import AppContextProvider from './context/AppContext.jsx' // Keep existing context for now if needed, or migrate
import ErrorBoundary from './Components/ErrorBoundary.jsx'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <AuthProvider>
              <AppContextProvider>
                <App />
                <Toaster position="top-right" />
              </AppContextProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
