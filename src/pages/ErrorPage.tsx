import { FallbackProps } from 'react-error-boundary'

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
        <button
          onClick={() => window.location.reload()}
          className="bg-primary-600 hover:bg-primary-700 rounded-md px-4 py-2 text-white transition-colors"
        >
          Recarregar página
        </button>
      </div>
    </div>
  )
}

export default ErrorPage
