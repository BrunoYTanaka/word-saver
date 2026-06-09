import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useModal } from '@/shared/context/ModalContext'

/**
 * Listens for in-app review events dispatched by the notification service
 * and opens the REVIEW_WORD modal. Also handles `?review=...&alert=...`
 * URL params on mount (notification fallback path).
 * Must be rendered inside <ModalProvider> and <BrowserRouter>.
 */
const NotificationNavigator = () => {
  const { openModal } = useModal()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    window.__WORD_SAVER_REVIEW_LISTENER__ = true

    const handler = (event: WindowEventMap['word-saver:review']) => {
      const { contextIds, alertId } = event.detail
      if (!contextIds?.length) return
      openModal('REVIEW_WORD', { contextIds, alertId })
    }

    window.addEventListener('word-saver:review', handler)
    return () => {
      window.removeEventListener('word-saver:review', handler)
      window.__WORD_SAVER_REVIEW_LISTENER__ = false
    }
  }, [openModal])

  useEffect(() => {
    const reviewParam = searchParams.get('review')
    if (!reviewParam) return
    const contextIds = reviewParam.split(',').filter(Boolean)
    const alertId = searchParams.get('alert') ?? undefined
    if (contextIds.length === 0) return

    openModal('REVIEW_WORD', { contextIds, alertId })

    const next = new URLSearchParams(searchParams)
    next.delete('review')
    next.delete('alert')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, openModal])

  return null
}

export default NotificationNavigator
