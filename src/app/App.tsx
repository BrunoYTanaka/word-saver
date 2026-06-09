import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '../store'
import { ThemeProvider } from '../shared/context/ThemeContext'
import { ModalProvider } from '../shared/context/ModalContext'
import Layout from '../shared/layout/Layout'
import { Router } from './router'
import { PWAInstallPrompt, PWAStatus } from '../core/pwa'
import { NotificationDebug } from '../core/notifications'
import { AppInitializer } from './AppInitializer'
import NotificationNavigator from './NotificationNavigator'

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppInitializer>
          <ModalProvider>
            <BrowserRouter>
              <NotificationNavigator />
              <Layout>
                <Router />
              </Layout>
            </BrowserRouter>
          </ModalProvider>
          <PWAInstallPrompt />
          <PWAStatus />
          {import.meta.env.DEV && <NotificationDebug />}
        </AppInitializer>
      </ThemeProvider>
    </Provider>
  )
}

export default App
