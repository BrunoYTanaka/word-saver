import { Button, useAppRouter } from '../shared'

function NotFoundPage() {
  const { navigateTo } = useAppRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="p-6 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800 dark:text-gray-200">
          404
        </h1>
        <p className="mb-4 text-xl text-gray-600 dark:text-gray-400">
          Página não encontrada
        </p>
        <p className="mb-6 text-gray-500 dark:text-gray-500">
          A página que você está procurando não existe.
        </p>
        <Button variant="primary" onClick={() => navigateTo('/dashboard')}>
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
