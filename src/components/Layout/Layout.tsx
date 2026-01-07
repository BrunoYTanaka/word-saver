import Header from './Header'
// import Navigation from "./Navigation";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-6">{children}</main>

      {/* Bottom Navigation for mobile */}
      {/* <Navigation /> */}
    </div>
  )
}

export default Layout
