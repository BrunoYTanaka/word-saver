import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '../store'
import { ThemeProvider } from '../shared/context/ThemeContext'
import { ModalProvider } from '../shared/context/ModalContext'
import Layout from '../shared/layout/Layout'
import { Router } from './router'
import { PWAInstallPrompt, PWAStatus } from '../core/pwa'
import { AppInitializer } from './AppInitializer'

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppInitializer>
          <ModalProvider>
            <BrowserRouter>
              <Layout>
                <Router />
              </Layout>
            </BrowserRouter>
          </ModalProvider>
          <PWAInstallPrompt />
          <PWAStatus />
        </AppInitializer>
      </ThemeProvider>
    </Provider>
  )
}

export default App
