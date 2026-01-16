import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from '../shared/context/AppContext'
import { useTheme } from '../shared/context/ThemeContext'
import { ThemeProvider } from '../shared/context/ThemeContext'
import { ModalProvider } from '../shared/context/ModalContext'
import Layout from '../shared/layout/Layout'
import { Router } from './router'
import { PWAInstallPrompt, PWAStatus } from '../core/pwa'

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useTheme()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="border-primary-200 border-t-primary-600 animate-spin mx-auto mb-4 size-8 rounded-full border-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Carregando Word Saver...
          </p>
        </div>
      </div>
    )
  }

  return children
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <ThemeWrapper>
          <ModalProvider>
            <BrowserRouter>
              <Layout>
                <Router />
              </Layout>
            </BrowserRouter>
          </ModalProvider>
          {/* PWA Components */}
          <PWAInstallPrompt />
          <PWAStatus />
        </ThemeWrapper>
      </AppProvider>
    </ThemeProvider>
  )
}

export default App
