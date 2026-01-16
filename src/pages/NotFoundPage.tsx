function NotFoundPage() {
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
        <a
          href="/dashboard"
          className="bg-primary-600 hover:bg-primary-700 inline-block rounded-md px-6 py-3 text-white transition-colors"
        >
          Voltar ao Dashboard
        </a>
      </div>
    </div>
  )
}

export default NotFoundPage
