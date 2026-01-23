import { FallbackProps } from 'react-error-boundary'
import { Button } from '@/shared'

function ErrorPage({ error }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="p-6 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-600">
          Oops! Algo deu errado
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          {error instanceof Error
            ? error.message
            : 'Ocorreu um erro inesperado'}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Recarregar página
        </Button>
      </div>
    </div>
  )
}

export default ErrorPage
