/** Pagina Preferiti - Ricette salvate */
import { Heart, BookOpen } from 'lucide-react'
import { useAppContext } from '../hooks/useAppContext'
import { RecipeCard } from '../components/RecipeCard'
import { demoRecipes } from '../data/demoRecipes'
import { enrichRecipes } from '../utils'
import type { Page } from '../components/BottomNav'

interface PreferitiPageProps {
  onNavigate: (page: Page) => void
}

export function PreferitiPage({ onNavigate }: PreferitiPageProps) {
  const { state, toggleFavorite, isFavorite, addShoppingItems } = useAppContext()
  const { favorites, ingredients } = state

  const enriched = enrichRecipes(demoRecipes, ingredients)
  const favoriteRecipes = enriched.filter(r => favorites.includes(r.id))

  const handleAddToShoppingList = (recipeId: string) => {
    const recipe = enriched.find(r => r.id === recipeId)
    if (!recipe || recipe.missingIngredients.length === 0) return

    const items = recipe.missingIngredients.map(name => ({
      name,
      checked: false,
      fromRecipeId: recipe.id,
      fromRecipeName: recipe.title,
    }))

    addShoppingItems(items)
    window.alert(`✅ Aggiunti ${items.length} ingredienti alla lista della spesa!`)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-gray-800 text-2xl flex items-center gap-2">
          <Heart size={22} className="text-red-400" fill="currentColor" />
          Preferiti
        </h1>
        <p className="text-sm text-gray-500">
          {favoriteRecipes.length} {favoriteRecipes.length === 1 ? 'ricetta salvata' : 'ricette salvate'}
        </p>
      </div>

      {favoriteRecipes.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow-soft border border-cream-200">
          <p className="text-5xl mb-4">❤️</p>
          <p className="font-display font-semibold text-gray-700 text-lg">Nessun preferito</p>
          <p className="text-sm text-gray-500 mt-1">
            Salva le ricette che ami toccando il cuore <Heart size={14} className="inline text-gray-400" /> nella sezione Ricette.
          </p>
          <button
            onClick={() => onNavigate('ricette')}
            className="mt-5 flex items-center gap-2 mx-auto px-5 py-2.5 bg-sage-500 text-white rounded-2xl text-sm font-medium hover:bg-sage-600 transition-colors"
          >
            <BookOpen size={16} />
            Vai alle ricette
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {favoriteRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={isFavorite(recipe.id)}
              onToggleFavorite={() => toggleFavorite(recipe.id)}
              onAddToShoppingList={() => handleAddToShoppingList(recipe.id)}
            />
          ))}
        </div>
      )}

      {/* Spazio navbar */}
      <div className="h-4" />
    </div>
  )
}
