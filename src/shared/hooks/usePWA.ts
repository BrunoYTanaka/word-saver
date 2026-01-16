import { useState, useEffect } from 'react'

interface PWAStatus {
  isInstalled: boolean
  isOnline: boolean
  isUpdateAvailable: boolean
  installPrompt: (() => void) | null
  updateApp: (() => void) | null
}

export const usePWA = (): PWAStatus => {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<(() => void) | null>(null)
  const [updateApp, setUpdateApp] = useState<(() => void) | null>(null)

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
      }
    }

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setInstallPrompt(() => async () => {
        e.prompt()
        const { outcome } = await e.userChoice
        console.log(`Install prompt outcome: ${outcome}`)
        setInstallPrompt(null)
      })
    }

    // Handle app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    // Handle SW update
    const handleSWUpdate = () => {
      setIsUpdateAvailable(true)
      setUpdateApp(() => () => {
        window.location.reload()
      })
    }

    checkInstalled()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                handleSWUpdate()
              }
            })
          }
        })
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return {
    isInstalled,
    isOnline,
    isUpdateAvailable,
    installPrompt,
    updateApp
  }
}

export default usePWA
