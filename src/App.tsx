/** Componente App principale - gestisce routing e layout */
import { useState } from 'react'
import { AppProvider } from './hooks/useAppContext'
import { BottomNav } from './components/BottomNav'
import type { Page } from './components/BottomNav'
import { HomePage } from './pages/HomePage'
import { FrigoPage } from './pages/FrigoPage'
import { RicettePage } from './pages/RicettePage'
import { SpesaPage } from './pages/SpesaPage'
import { ChefBotPage } from './pages/ChefBotPage'
import { PreferitiPage } from './pages/PreferitiPage'

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />
      case 'frigo':
        return <FrigoPage />
      case 'ricette':
        return <RicettePage />
      case 'spesa':
        return <SpesaPage />
      case 'chefbot':
        return <ChefBotPage />
      case 'preferiti':
        return <PreferitiPage onNavigate={setCurrentPage} />
      default:
        return <HomePage onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Area di contenuto con padding per navbar */}
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
        {renderPage()}
      </main>

      {/* Navigazione inferiore */}
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
