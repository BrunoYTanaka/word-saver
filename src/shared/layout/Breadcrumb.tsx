import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const Breadcrumb = () => {
  const location = useLocation()

  const getBreadcrumbData = (pathname: string) => {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return {
          title: 'Dashboard',
          description: 'Visão geral das suas palavras e atividades'
        }
      case '/flashcards':
        return {
          title: 'Flashcards',
          description: 'Revise suas palavras de forma interativa'
        }
      case '/quiz':
        return {
          title: 'Quiz',
          description: 'Teste seus conhecimentos com um quiz interativo'
        }
      case '/statistics':
        return {
          title: 'Estatísticas',
          description:
            'Acompanhe seu progresso e analise seus dados de aprendizado'
        }
      default:
        return {
          title: 'Dashboard',
          description: 'Visão geral das suas palavras e atividades'
        }
    }
  }

  const breadcrumb = getBreadcrumbData(location.pathname)

  return (
    <div className="border-b border-border bg-surface">
      <div className="container mx-auto max-w-7xl p-4">
        {/* Breadcrumb Navigation */}
        <nav className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to="/dashboard"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Home size={14} />
            <span>Início</span>
          </Link>
          {location.pathname !== '/' && location.pathname !== '/dashboard' && (
            <>
              <ChevronRight size={14} />
              <span className="font-medium text-foreground">
                {breadcrumb.title}
              </span>
            </>
          )}
        </nav>

        {/* Page Title & Description */}
        <div>
          <h1 className="mb-1 text-2xl font-bold text-foreground">
            {breadcrumb.title}
          </h1>
          <p className="text-muted-foreground">{breadcrumb.description}</p>
        </div>
      </div>
    </div>
  )
}

export default Breadcrumb
