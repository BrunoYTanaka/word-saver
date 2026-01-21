const Settings = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="p-6 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-gray-200">
          Configurações
        </h1>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Página de configurações da aplicação
        </p>
        <div className="rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900">
          <p className="text-yellow-800 dark:text-yellow-200">
            Esta página foi adicionada apenas alterando o ROUTE_CONFIG!
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings
