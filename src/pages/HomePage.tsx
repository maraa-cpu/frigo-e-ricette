/** Dashboard - Home page dell'app */
import { Package, ChefHat, AlertTriangle, Sparkles, Trash2, Leaf } from 'lucide-react'
import { useAppContext } from '../hooks/useAppContext'
import { demoRecipes } from '../data/demoRecipes'
import { enrichRecipes, isExpiringSoon, daysUntilExpiration } from '../utils'
import { EXPIRATION_THRESHOLDS } from '../data/constants'
import { ExpirationBadge } from '../components/ExpirationBadge'
import type { Page } from '../components/BottomNav'

interface HomePageProps {
  onNavigate: (page: Page) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { state, clearFridge } = useAppContext()
  const { ingredients } = state

  // Ricette arricchite
  const enriched = enrichRecipes(demoRecipes, ingredients)
  const topRecipes = enriched.slice(0, 3)

  // Ingredienti in scadenza
  const expiringSoon = ingredients
    .filter(i => i.expirationDate && isExpiringSoon(i, EXPIRATION_THRESHOLDS.WARNING))
    .sort((a, b) => {
      const dA = daysUntilExpiration(a.expirationDate!)
      const dB = daysUntilExpiration(b.expirationDate!)
      return dA - dB
    })

  const handleClearFridge = () => {
    if (window.confirm('Sei sicuro di voler svuotare tutto il frigo?')) {
      clearFridge()
    }
  }

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header saluto */}
      <div className="bg-gradient-to-br from-sage-400 to-sage-600 rounded-3xl p-5 text-white shadow-glow">
        <p className="text-sage-100 text-sm font-medium">{greeting}! 👋</p>
        <h1 className="font-display text-2xl font-semibold mt-0.5">
          Frigo & Ricette
        </h1>
        <p className="text-sage-100 text-sm mt-1">
          Cucina bene con quello che hai 🍃
        </p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onNavigate('chefbot')}
            className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all"
            id="btn-cosa-cucino"
          >
            <Sparkles size={16} />
            Cosa cucino oggi?
          </button>
          <button
            onClick={handleClearFridge}
            className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur rounded-2xl px-3 py-2.5 text-sm transition-all"
            id="btn-svuota-frigo"
            title="Svuota frigo"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Statistiche veloci */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('frigo')}
          className="bg-white rounded-2xl p-3 shadow-soft border border-cream-200 text-center hover:shadow-card transition-shadow"
          id="stat-ingredienti"
        >
          <Package size={22} className="text-sage-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-800">{ingredients.length}</div>
          <div className="text-xs text-gray-500">Ingredienti</div>
        </button>
        <button
          onClick={() => onNavigate('ricette')}
          className="bg-white rounded-2xl p-3 shadow-soft border border-cream-200 text-center hover:shadow-card transition-shadow"
          id="stat-ricette"
        >
          <ChefHat size={22} className="text-terracotta-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-800">{demoRecipes.length}</div>
          <div className="text-xs text-gray-500">Ricette</div>
        </button>
        <button
          onClick={() => onNavigate('frigo')}
          className="bg-white rounded-2xl p-3 shadow-soft border border-cream-200 text-center hover:shadow-card transition-shadow"
          id="stat-scadenze"
        >
          <AlertTriangle size={22} className="text-amber-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-800">{expiringSoon.length}</div>
          <div className="text-xs text-gray-500">In scadenza</div>
        </button>
      </div>

      {/* Ingredienti in scadenza */}
      {expiringSoon.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Da consumare presto
            </h2>
            <button
              onClick={() => onNavigate('chefbot')}
              className="text-xs text-sage-500 font-medium"
            >
              Chiedi a ChefBot →
            </button>
          </div>
          <div className="space-y-2">
            {expiringSoon.slice(0, 4).map(ing => (
              <div
                key={ing.id}
                className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-soft border border-amber-100"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">{ing.name}</p>
                  <p className="text-xs text-gray-500">{ing.quantity} {ing.unit}</p>
                </div>
                <ExpirationBadge expirationDate={ing.expirationDate!} small />
              </div>
            ))}
            {expiringSoon.length > 4 && (
              <button
                onClick={() => onNavigate('frigo')}
                className="w-full text-center text-sm text-sage-500 font-medium py-1"
              >
                +{expiringSoon.length - 4} altri →
              </button>
            )}
          </div>
        </section>
      )}

      {/* Ricette consigliate */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-gray-800 flex items-center gap-2">
            <Leaf size={16} className="text-green-500" />
            Ricette consigliate
          </h2>
          <button
            onClick={() => onNavigate('ricette')}
            className="text-xs text-sage-500 font-medium"
          >
            Vedi tutte →
          </button>
        </div>

        {ingredients.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center shadow-soft border border-cream-200">
            <p className="text-4xl mb-3">🛒</p>
            <p className="font-medium text-gray-700">Frigo vuoto!</p>
            <p className="text-sm text-gray-500 mt-1">Aggiungi ingredienti per ricevere suggerimenti.</p>
            <button
              onClick={() => onNavigate('frigo')}
              className="mt-4 px-5 py-2.5 bg-sage-500 text-white rounded-2xl text-sm font-medium hover:bg-sage-600 transition-colors"
            >
              Aggiungi ingredienti
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {topRecipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => onNavigate('ricette')}
                className="w-full bg-white rounded-2xl px-4 py-3.5 shadow-soft border border-cream-200 text-left hover:shadow-card transition-all flex items-center gap-3"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{recipe.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ✓ {recipe.availableIngredients.length} ingredienti già presenti
                    {recipe.missingIngredients.length > 0 && (
                      <span className="text-red-500 ml-2">
                        ✗ {recipe.missingIngredients.length} mancanti
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold rounded-full px-2 py-0.5
                    ${recipe.antiWasteScore >= 70 ? 'bg-green-100 text-green-700' :
                      recipe.antiWasteScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'}`}
                  >
                    🌱 {recipe.antiWasteScore}
                  </span>
                  <ChefHat size={16} className="text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Spazio per la navbar */}
      <div className="h-4" />
    </div>
  )
}
