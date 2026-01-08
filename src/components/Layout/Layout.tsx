import Header from './Header'
import Navigation from './Navigation'
import Breadcrumb from './Breadcrumb'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-6">{children}</main>

      {/* Bottom Navigation for mobile */}
      <Navigation />
    </div>
  )
}

export default Layout
