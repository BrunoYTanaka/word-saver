import { AppProvider } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout/Layout'
import Dashboard from '../pages/Dashboard'
import PWAInstallPrompt from '../components/PWA/PWAInstallPrompt'
import PWAStatus from '../components/PWA/PWAStatus'
import { ThemeProvider } from '../context/ThemeContext'
import { ModalProvider } from '../context/ModalContext'

// Theme wrapper component
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useTheme()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="border-primary-200 border-t-primary-600 mx-auto mb-4 size-8 animate-spin rounded-full border-4"></div>
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
            <Layout>
              <Dashboard />
            </Layout>
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
