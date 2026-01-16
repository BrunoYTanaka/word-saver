// Exemplo de página de configurações para demonstrar como adicionar novas rotas
const Settings = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Configurações
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Página de configurações da aplicação
        </p>
        <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200">
            Esta página foi adicionada apenas alterando o ROUTE_CONFIG!
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings
