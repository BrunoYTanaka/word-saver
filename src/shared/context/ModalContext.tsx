import { createContext, useContext, useState } from 'react'
import AddWordModal from '../../features/vocabulary/words/components/AddWordModal'
import EditWordModal from '../../features/vocabulary/words/components/EditWordModal'
import AddContextModal from '../../features/vocabulary/contexts/components/AddContextModal'
import EditContextModal from '../../features/vocabulary/contexts/components/EditContextModal'
import AddAlertModal from '../../features/alerts/components/AddAlertModal'
import EditAlertModal from '../../features/alerts/components/EditAlertModal'
import SettingsModal from '../../features/settings/components/SettingsModal'
import ExportDataModal from '../../features/data-management/export/components/ExportDataModal'
import ImportDataModal from '../../features/data-management/import/components/ImportDataModal'
import ReviewWordModal from '../../features/vocabulary/words/components/ReviewWordModal'

type ModalPropsMap = {
  ADD_WORD: undefined
  EDIT_WORD: { wordId: string }
  ADD_CONTEXT: undefined
  EDIT_CONTEXT: { contextId: string }
  ADD_ALERT: undefined
  EDIT_ALERT: { alertId: string }
  SETTINGS: undefined
  EXPORT_DATA: undefined
  IMPORT_DATA: undefined
  REVIEW_WORD: { contextIds: string[]; alertId?: string }
}

type ModalType = keyof ModalPropsMap
interface ModalContextType {
  openModal: <T extends ModalType>(key: T, props?: ModalPropsMap[T]) => void
  closeModal: (key: ModalType) => void
  isOpen: (key: ModalType) => boolean
  getProps: <T extends ModalType>(key: T) => ModalPropsMap[T] | undefined
}

const ModalContext = createContext<ModalContextType>({} as ModalContextType)

type ModalState = {
  [K in ModalType]?: {
    open: boolean
    props?: ModalPropsMap[K]
  }
}

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [modals, setModals] = useState<ModalState>({})

  const openModal = <T extends ModalType>(key: T, props?: ModalPropsMap[T]) => {
    setModals((prev) => ({ ...prev, [key]: { open: true, props } }))
  }

  const closeModal = (key: ModalType) => {
    setModals((prev) => ({ ...prev, [key]: { ...prev[key], open: false } }))
  }

  const isOpen = (key: ModalType) => !!modals[key]?.open
  const getProps = <T extends ModalType>(key: T) => modals[key]?.props

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isOpen, getProps }}>
      {children}

      {isOpen('ADD_WORD') && <AddWordModal />}
      {isOpen('EDIT_WORD') && <EditWordModal {...getProps('EDIT_WORD')!} />}
      {isOpen('ADD_CONTEXT') && <AddContextModal />}
      {isOpen('EDIT_CONTEXT') && (
        <EditContextModal {...getProps('EDIT_CONTEXT')!} />
      )}
      {isOpen('ADD_ALERT') && <AddAlertModal />}
      {isOpen('EDIT_ALERT') && <EditAlertModal {...getProps('EDIT_ALERT')!} />}
      {isOpen('SETTINGS') && <SettingsModal />}
      {isOpen('EXPORT_DATA') && <ExportDataModal />}
      {isOpen('IMPORT_DATA') && <ImportDataModal />}
      {isOpen('REVIEW_WORD') && (
        <ReviewWordModal {...getProps('REVIEW_WORD')!} />
      )}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)

  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }

  return context
}
