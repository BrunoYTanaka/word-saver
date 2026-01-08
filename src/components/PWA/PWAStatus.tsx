// PWA Status Component
import React, { useState, useEffect } from 'react'
import { usePWA } from '../../hooks/usePWA'
import Button from '../UI/Button'

export const PWAStatus: React.FC = () => {
  const { isOnline, isUpdateAvailable, updateApp } = usePWA()
  const [showOnlineStatus, setShowOnlineStatus] = useState(false)

  useEffect(() => {
    if (isOnline && !isUpdateAvailable) {
      setShowOnlineStatus(true)

      // Após 3 segundos (duração da animação), remover completamente
      const timer = setTimeout(() => {
        setShowOnlineStatus(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOnline, isUpdateAvailable])

  // Se não há nada para mostrar, não renderiza nada
  if (!isOnline && !isUpdateAvailable && !showOnlineStatus) {
    return null
  }

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {/* Offline Status */}
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-lg bg-warning px-4 py-2 text-warning-foreground shadow-lg">
          <span className="animate-pulse size-2 rounded-full bg-white"></span>
          <span className="text-sm font-medium">Modo Offline</span>
        </div>
      )}

      {/* Update Available */}
      {!isUpdateAvailable && updateApp && (
        <div className="rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-lg">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-medium">Atualização disponível!</p>
              <p className="text-xs opacity-90">
                Nova versão do app está pronta
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={updateApp}
              className="bg-surface text-primary hover:bg-surface-hover"
            >
              Atualizar
            </Button>
          </div>
        </div>
      )}

      {/* Online Status (only show briefly when coming back online) */}
      {showOnlineStatus && (
        <div className="animate-fade-in-out rounded-lg bg-success px-4 py-2 text-success-foreground shadow-lg">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-white"></span>
            <span className="text-sm font-medium">Conectado</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PWAStatus
