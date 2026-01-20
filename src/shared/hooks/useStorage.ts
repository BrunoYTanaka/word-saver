import { useCallback, useEffect, useState } from 'react'
import { useAppSelector } from '@/store/hooks'

interface StorageInfo {
  storageInfo: string
  calculateStorageUsage: (data: unknown) => string
}

export function useStorageUsage(): StorageInfo {
  const [storageInfo, setStorageInfo] = useState('')
  const { words } = useAppSelector((state) => state.words)
  const { contexts } = useAppSelector((state) => state.contexts)
  const { alerts } = useAppSelector((state) => state.alerts)

  const calculateStorageUsage = useCallback((data: unknown) => {
    try {
      const dataSize = JSON.stringify(data).length
      const sizeInKB = (dataSize / 1024).toFixed(1)
      const sizeInMB =
        dataSize > 1024 * 1024 ? (dataSize / (1024 * 1024)).toFixed(2) : null

      return sizeInMB ? `${sizeInMB} MB` : `${sizeInKB} KB`
    } catch (error) {
      console.error('Erro ao calcular uso de armazenamento:', error)
      return 'N/A'
    }
  }, [])

  useEffect(() => {
    const storageUsage = calculateStorageUsage({ words, contexts, alerts })
    setStorageInfo(storageUsage)
  }, [words, contexts, alerts, calculateStorageUsage])

  return { storageInfo, calculateStorageUsage }
}
