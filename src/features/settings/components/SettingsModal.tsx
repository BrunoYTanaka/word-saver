import { FileDown, FileUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useApp } from '@/shared/hooks'
import { useAppSelector } from '@/store/hooks'
import Modal from '@/shared/ui/Modal'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { useTheme } from '@/shared/context/ThemeContext'
import pckInfo from '../../../../package.json'
import { useModal } from '@/shared/context/ModalContext'
import { cn } from '@/shared/utils/cn'

const SettingsModal = () => {
  const { isNotificationEnabled } = useApp()
  const { words } = useAppSelector((state) => state.words)
  const { contexts } = useAppSelector((state) => state.contexts)
  const { alerts } = useAppSelector((state) => state.alerts)
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
        // Delete all data from stores
        const wordStore = (
          await import('../../vocabulary/words/stores/word-store')
        ).default
        const contextStore = (
          await import('../../vocabulary/contexts/stores/context-store')
        ).default
        const alertStore = (await import('../../alerts/stores/alert-store'))
          .default

        await Promise.all([
          wordStore.clear(),
          contextStore.clear(),
          alertStore.clear()
        ])

        // Refresh all data
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
          <h3 className="mb-4 font-semibold text-foreground">
            Estatísticas da Aplicação
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Words Count */}
            <Card className="text-center">
              <div className="text-3xl font-bold text-primary">
                {words.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Palavra{words.length !== 1 ? 's' : ''}
              </div>
            </Card>

            {/* Contexts Count */}
            <Card className="text-center">
              <div className="text-3xl font-bold text-success">
                {contexts.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Contexto{contexts.length !== 1 ? 's' : ''}
              </div>
            </Card>

            {/* Alerts Count */}
            <Card className="text-center">
              <div className="text-3xl font-bold text-warning">
                {alerts.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Alerta{alerts.length !== 1 ? 's' : ''}
              </div>
            </Card>
          </div>
        </div>

        {/* App Preferences */}
        <div>
          <h3 className="mb-4 font-semibold text-foreground">Preferências</h3>

          <Card>
            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">
                    Tema da Aplicação
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isDark ? 'Tema escuro ativo' : 'Tema claro ativo'}
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  role="switch"
                  aria-checked={isDark}
                  aria-label="Alternar tema da aplicação"
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
                    isDark ? 'bg-primary' : 'bg-muted hover:bg-surface-muted'
                  )}
                >
                  <span
                    className={`${cn(
                      'inline-block size-4 rounded-full bg-white transition-transform',
                      isDark ? 'translate-x-6' : 'translate-x-1'
                    )}`}
                  />
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">
                    Notificações
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Receber lembretes de revisão
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={isNotificationEnabled}
                  aria-label="Alternar notificações"
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
                    isNotificationEnabled
                      ? 'bg-primary'
                      : 'bg-muted hover:bg-surface-muted'
                  )}
                >
                  <span
                    className={`${cn(
                      'inline-block size-4 rounded-full bg-white transition-transform',
                      isNotificationEnabled ? 'translate-x-6' : 'translate-x-1'
                    )}`}
                  />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Data Management */}
        <div>
          <h3 className="mb-4 font-semibold text-foreground">
            Gerenciar Dados
          </h3>

          <Card>
            <div className="space-y-4">
              {/* Export/Import Section */}
              <div>
                <div className="mb-3 font-medium text-foreground">
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
                <div className="mt-2 text-sm text-muted-foreground">
                  Faça backup dos seus dados ou importe de outro dispositivo
                </div>
              </div>

              {/* Storage Info */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">
                      Uso de Armazenamento
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Dados armazenados localmente
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-foreground">
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
          <h3 className="mb-4 font-semibold text-foreground">
            Sobre a Aplicação
          </h3>

          <Card>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versão:</span>
                <span className="font-mono text-sm">{appInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build:</span>
                <span className="font-mono text-sm">{appInfo.buildDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plataforma:</span>
                <span className="font-mono text-sm">Web PWA</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Danger Zone */}
        <div>
          <h3 className="mb-4 font-semibold text-destructive">
            ⚠️ Zona de Perigo
          </h3>

          <Card className="border-destructive bg-destructive-soft">
            <div className="space-y-3">
              <div>
                <div className="font-medium text-destructive">
                  Limpar Todos os Dados
                </div>
                <div className="text-sm text-destructive opacity-70">
                  Remove permanentemente todas as palavras, contextos, alertas e
                  configurações. Esta ação não pode ser desfeita!
                </div>
              </div>
              <Button
                variant="outline"
                onClick={clearAllData}
                className="border-solid border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Limpar Todos os Dados
              </Button>
            </div>
          </Card>
        </div>

        {/* Close Button */}
        <div className="flex justify-end border-t border-border pt-4">
          <Button onClick={() => closeModal('SETTINGS')}>Fechar</Button>
        </div>
      </div>
    </Modal>
  )
}

export default SettingsModal
