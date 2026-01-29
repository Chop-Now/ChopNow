import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
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
          <AuthProvider>
            <AppContextProvider>
              <App />
              <Toaster position="top-right" />
            </AppContextProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
