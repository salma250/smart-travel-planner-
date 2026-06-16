import '../styles/globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { AuthProvider } from '../context/AuthContext'

export const metadata = {
  title: 'Smart Travel — Travel Planner',
  description: 'Premium travel planning experience',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-smarttravel-primary/10 via-transparent to-transparent dark:from-black">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-smarttravel-primary/10 via-transparent to-smarttravel-accent/5 opacity-70 animate-[pulse_12s_infinite]" />
        </div>

        <AuthProvider>
          <Navbar />

          <main className="container mx-auto px-6 py-10">
            {children}
          </main>

          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
