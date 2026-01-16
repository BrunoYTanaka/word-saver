import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from '../shared/context/AppContext'
import { useTheme } from '../shared/context/ThemeContext'
import { ThemeProvider } from '../shared/context/ThemeContext'
import { ModalProvider } from '../shared/context/ModalContext'
import Layout from '../shared/layout/Layout'
import Dashboard from '../pages/dashboard/Dashboard'
import { Flashcards } from '../features/learning/flashcards'
import { Quiz } from '../features/learning/quiz'
import { Statistics } from '../features/analytics/statistics'
import { PWAInstallPrompt, PWAStatus } from '../core/pwa'

// Theme wrapper component
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
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/flashcards" element={<Flashcards />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/statistics" element={<Statistics />} />
                </Routes>
              </Layout>
            </Router>
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
