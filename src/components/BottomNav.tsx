/** Navbar inferiore per smartphone - navigazione principale */
import { Home, Package, BookOpen, ShoppingCart, Bot, Heart, type LucideIcon } from 'lucide-react'

export type Page = 'home' | 'frigo' | 'ricette' | 'spesa' | 'chefbot' | 'preferiti'

interface BottomNavProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems: Array<{ id: Page; icon: LucideIcon; label: string }> = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'frigo', icon: Package, label: 'Frigo' },
  { id: 'ricette', icon: BookOpen, label: 'Ricette' },
  { id: 'spesa', icon: ShoppingCart, label: 'Spesa' },
  { id: 'chefbot', icon: Bot, label: 'ChefBot' },
  { id: 'preferiti', icon: Heart, label: 'Preferiti' },
]

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-cream-200 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = currentPage === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-2xl transition-all duration-200 min-w-[52px]
                ${isActive
                  ? 'text-sage-500 bg-sage-50'
                  : 'text-gray-400 hover:text-sage-400 hover:bg-sage-50/50'
                }`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={22}
                className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
              />
              <span className={`text-[10px] font-medium transition-all ${isActive ? 'text-sage-600' : ''}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute -top-0.5 w-4 h-0.5 bg-sage-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
