import { FileDown, FileUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import Card from '../UI/Card'
import { useTheme } from '../../context/ThemeContext'
import pckInfo from '../../../package.json'
import { useModal } from '../../context/ModalContext'

const SettingsModal = () => {
  const { words, contexts, alerts, deleteAllData } = useApp()
  const { closeModal, openModal } = useModal()

  const { isDark, toggleTheme } = useTheme()
  const [appInfo, setAppInfo] = useState({
    version: pckInfo.version,
    buildDate: new Date().toLocaleDateString('pt-BR'),
    totalStorage: '0 KB'
  })
  // Calculate storage and stats when modal opens
  useEffect(() => {
    const calculateStorageUsage = () => {
      try {
        // Estimate storage usage
        const dataSize = JSON.stringify({ words, contexts, alerts }).length
        const sizeInKB = (dataSize / 1024).toFixed(1)
        const sizeInMB =
          dataSize > 1024 * 1024 ? (dataSize / (1024 * 1024)).toFixed(2) : null

        setAppInfo((prev) => ({
          ...prev,
          totalStorage: sizeInMB ? `${sizeInMB} MB` : `${sizeInKB} KB`
        }))
      } catch (error) {
        console.error('Erro ao calcular uso de armazenamento:', error)
      }
    }

    calculateStorageUsage()
  }, [words, contexts, alerts])

  const clearAllData = async () => {
    if (
      window.confirm(
        '⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados da aplicação (palavras, contextos, alertas e configurações).\n\n' +
          'Esta ação não pode ser desfeita!\n\n' +
          'Deseja continuar?'
      )
    ) {
      try {
        // Clear all data from IndexedDB
        await deleteAllData()

        // Reload the page to reset state
        window.location.reload()
      } catch (error) {
        console.error('Erro ao limpar dados:', error)
        alert('Erro ao limpar dados. Tente novamente.')
      }
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={() => closeModal('SETTINGS')}
      title="Configurações"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* App Statistics */}
        <div>
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
            Estatísticas da Aplicação
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Words Count */}
            <Card className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {words.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Palavra{words.length !== 1 ? 's' : ''}
              </div>
            </Card>

            {/* Contexts Count */}
            <Card className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {contexts.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Contexto{contexts.length !== 1 ? 's' : ''}
              </div>
            </Card>

            {/* Alerts Count */}
            <Card className="text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {alerts.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Alerta{alerts.length !== 1 ? 's' : ''}
              </div>
            </Card>
          </div>
        </div>

        {/* App Preferences */}
        <div>
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
            Preferências
          </h3>

          <Card>
            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Tema da Aplicação
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {isDark ? 'Tema escuro ativo' : 'Tema claro ativo'}
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative inline-flex h-6 w-11 items-center rounded-full border-0 bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                >
                  <span
                    className={`${
                      isDark ? 'translate-x-6' : 'translate-x-1'
                    } inline-block size-4 rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Notificações
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Receber lembretes de revisão
                  </div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full border-0 bg-blue-600 transition-colors">
                  <span className="inline-block size-4 translate-x-6 rounded-full bg-white transition-transform" />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Data Management */}
        <div>
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
            Gerenciar Dados
          </h3>

          <Card>
            <div className="space-y-4">
              {/* Export/Import Section */}
              <div>
                <div className="mb-3 font-medium text-gray-900 dark:text-gray-100">
                  Backup e Restauração
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={() => openModal('EXPORT_DATA')}
                    className="[&>span]:flex [&>span]:items-center [&>span]:space-x-2"
                  >
                    <FileDown className="size-4" />
                    <span>Exportar Dados</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => openModal('IMPORT_DATA')}
                    className="[&>span]:flex [&>span]:items-center [&>span]:space-x-2"
                  >
                    <FileUp className="size-4" />
                    <span>Importar Dados</span>
                  </Button>
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Faça backup dos seus dados ou importe de outro dispositivo
                </div>
              </div>

              {/* Storage Info */}
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      Uso de Armazenamento
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Dados armazenados localmente
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                      {appInfo.totalStorage}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* About Section */}
        <div>
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
            Sobre a Aplicação
          </h3>

          <Card>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Versão:
                </span>
                <span className="font-mono text-sm">{appInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Build:</span>
                <span className="font-mono text-sm">{appInfo.buildDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Plataforma:
                </span>
                <span className="font-mono text-sm">Web PWA</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Danger Zone */}
        <div>
          <h3 className="mb-4 font-semibold text-red-600 dark:text-red-400">
            ⚠️ Zona de Perigo
          </h3>

          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <div className="space-y-3">
              <div>
                <div className="font-medium text-red-900 dark:text-red-100">
                  Limpar Todos os Dados
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  Remove permanentemente todas as palavras, contextos, alertas e
                  configurações. Esta ação não pode ser desfeita!
                </div>
              </div>
              <Button
                variant="outline"
                onClick={clearAllData}
                className="border-solid border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                Limpar Todos os Dados
              </Button>
            </div>
          </Card>
        </div>

        {/* Close Button */}
        <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button onClick={() => closeModal('SETTINGS')}>Fechar</Button>
        </div>
      </div>
    </Modal>
  )
}

export default SettingsModal
