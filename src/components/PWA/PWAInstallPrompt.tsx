// PWA Install Prompt Component
import React, { useState, useEffect } from 'react'
import Button from '../UI/Button'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true)
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    checkInstalled()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Hide for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed, dismissed, or no prompt available
  if (
    isInstalled ||
    !showInstallPrompt ||
    !deferredPrompt ||
    sessionStorage.getItem('pwa-install-dismissed') === 'true'
  ) {
    return null
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-lg border bg-surface p-4 shadow-lg md:left-auto md:right-4 md:w-80">
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <img
            src="/pwa-192x192.png"
            alt="Word Saver"
            className="size-12 rounded-lg"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">
            Instalar Word Saver
          </h3>
          <p className="mt-1 text-xs text-muted">
            Instale o app para acesso rápido e funcionamento offline
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleInstallClick} className="flex-1">
              📱 Instalar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="px-3"
            >
              ✕
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
