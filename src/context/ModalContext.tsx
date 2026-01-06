import { createContext, useContext, useState } from 'react'
import AddWordModal from '../components/Modals/AddWordModal'
import EditWordModal from '../components/Modals/EditWordModal'
import AddContextModal from '../components/Modals/AddContextModal'
import SetAlertModal from '../components/Modals/SetAlertModal'
import SettingsModal from '../components/Modals/SettingsModal'
import ExportDataModal from '../components/Modals/ExportDataModal'

interface ModalContextType {
  openModal: (key: ModalType, props?: any) => void
  closeModal: (key: ModalType) => void
  isOpen: (key: ModalType) => boolean
  getProps: (key: ModalType) => any
}

const ModalContext = createContext<ModalContextType>({} as ModalContextType)

const ModalTypes = {
  ADD_WORD: 'ADD_WORD',
  EDIT_WORD: 'EDIT_WORD',
  ADD_CONTEXT: 'ADD_CONTEXT',
  ADD_ALERT: 'ADD_ALERT',
  SET_ALERT: 'SET_ALERT',
  SETTINGS: 'SETTINGS',
  EXPORT_DATA: 'EXPORT_DATA',
  IMPORT_DATA: 'IMPORT_DATA'
} as const

interface ModalState {
  [key: string]: { open: boolean; props?: any }
}

type ModalType = keyof typeof ModalTypes

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [modals, setModals] = useState<ModalState>({})

  const openModal = (key: ModalType, props?: any) => {
    setModals((prev) => ({ ...prev, [key]: { open: true, props } }))
  }

  const closeModal = (key: ModalType) => {
    setModals((prev) => ({ ...prev, [key]: { ...prev[key], open: false } }))
  }

  const isOpen = (key: ModalType) => !!modals[key]?.open
  const getProps = (key: ModalType) => modals[key]?.props

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isOpen, getProps }}>
      {children}

      {isOpen('ADD_WORD') && (
        <AddWordModal
          {...getProps('ADD_WORD')}
          onClose={() => closeModal('ADD_WORD')}
        />
      )}
      {isOpen('EDIT_WORD') && (
        <EditWordModal
          {...getProps('EDIT_WORD')}
          onClose={() => closeModal('EDIT_WORD')}
        />
      )}
      {isOpen('ADD_CONTEXT') && (
        <AddContextModal
          {...getProps('ADD_CONTEXT')}
          onClose={() => closeModal('ADD_CONTEXT')}
        />
      )}
      {isOpen('SET_ALERT') && (
        <SetAlertModal
          {...getProps('SET_ALERT')}
          onClose={() => closeModal('SET_ALERT')}
        />
      )}
      {isOpen('SETTINGS') && (
        <SettingsModal
          {...getProps('SETTINGS')}
          onClose={() => closeModal('SETTINGS')}
        />
      )}
      {isOpen('EXPORT_DATA') && (
        <ExportDataModal
          {...getProps('EXPORT_DATA')}
          onClose={() => closeModal('EXPORT_DATA')}
        />
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
