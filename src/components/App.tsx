import { AppProvider } from '../context/AppContext'
import { useTheme } from '../hooks/useTheme'
import Layout from '../components/Layout/Layout'
import Dashboard from '../pages/Dashboard'
import AddWordModal from '../components/Modals/AddWordModal'
import AddContextModal from '../components/Modals/AddContextModal'
import SetAlertModal from '../components/Modals/SetAlertModal'
import SettingsModal from '../components/Modals/SettingsModal'
import ExportDataModal from '../components/Modals/ExportDataModal'
import { ThemeProvider } from '../context/ThemeContext'

// Theme wrapper component
function ThemeWrapper({ children }) {
  const { isLoading } = useTheme()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
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
          <Layout>
            <Dashboard />
          </Layout>

          {/* Modals */}
          <AddWordModal />
          <AddContextModal />
          <SetAlertModal />
          <SettingsModal />
          <ExportDataModal />
        </ThemeWrapper>
      </AppProvider>
    </ThemeProvider>
  )
}

export default App
