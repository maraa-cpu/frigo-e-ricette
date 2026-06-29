/** Pagina Ricette - con filtri e score anti-spreco */
import { useState, useMemo } from 'react'
import { Filter, X } from 'lucide-react'
import { useAppContext } from '../hooks/useAppContext'
import { RecipeCard } from '../components/RecipeCard'
import { demoRecipes } from '../data/demoRecipes'
import { enrichRecipes } from '../utils'
import type { RecipeTag } from '../types'

const TAG_OPTIONS: Array<{ value: RecipeTag; label: string; emoji: string }> = [
  { value: 'veloce', label: 'Veloce', emoji: '⚡' },
  { value: 'economica', label: 'Economica', emoji: '💰' },
  { value: 'svuota-frigo', label: 'Svuota frigo', emoji: '🧹' },
  { value: 'pochi-ingredienti', label: 'Pochi ingredienti', emoji: '🎯' },
  { value: 'vegetariana', label: 'Vegetariana', emoji: '🥦' },
  { value: 'cena-leggera', label: 'Cena leggera', emoji: '🌙' },
  { value: 'pranzo-veloce', label: 'Pranzo veloce', emoji: '☀️' },
  { value: 'proteica', label: 'Proteica', emoji: '💪' },
]

export function RicettePage() {
  const { state, toggleFavorite, isFavorite, addShoppingItems } = useAppContext()
  const { ingredients } = state

  const [selectedTags, setSelectedTags] = useState<RecipeTag[]>([])
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Arricchisci tutte le ricette
  const enriched = useMemo(
    () => enrichRecipes(demoRecipes, ingredients),
    [ingredients]
  )

  // Applica filtri
  const filtered = useMemo(() => {
    return enriched.filter(recipe => {
      if (selectedTags.length > 0 && !selectedTags.some(t => recipe.tags.includes(t))) return false
      if (onlyAvailable && recipe.missingIngredients.length > 0) return false
      return true
    })
  }, [enriched, selectedTags, onlyAvailable])

  const toggleTag = (tag: RecipeTag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

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

  const activeFiltersCount = selectedTags.length + (onlyAvailable ? 1 : 0)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-gray-800 text-2xl">Ricette</h1>
          <p className="text-sm text-gray-500">
            Ordinate per score anti-spreco 🌱
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          id="btn-filtri"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-sm font-medium border transition-all
            ${activeFiltersCount > 0
              ? 'bg-sage-500 text-white border-sage-500'
              : 'bg-white text-gray-600 border-cream-200 hover:border-sage-300'
            }`}
        >
          <Filter size={16} />
          Filtri
          {activeFiltersCount > 0 && (
            <span className="bg-white text-sage-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Pannello filtri */}
      {showFilters && (
        <div className="bg-white rounded-3xl p-4 shadow-soft border border-cream-200 animate-slide-up space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-700">Filtra ricette</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => { setSelectedTags([]); setOnlyAvailable(false) }}
                className="text-xs text-red-500 flex items-center gap-1"
              >
                <X size={12} /> Rimuovi tutti
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map(({ value, label, emoji }) => (
              <button
                key={value}
                onClick={() => toggleTag(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${selectedTags.includes(value)
                    ? 'bg-sage-500 text-white border-sage-500'
                    : 'bg-white text-gray-600 border-cream-200 hover:border-sage-300'
                  }`}
              >
                {emoji} {label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer
                ${onlyAvailable ? 'bg-sage-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                ${onlyAvailable ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </div>
            <span className="text-sm text-gray-700">Solo con ingredienti disponibili</span>
          </label>
        </div>
      )}

      {/* Legenda score */}
      <div className="bg-cream-100 rounded-2xl px-4 py-2.5 flex items-center gap-2">
        <span className="text-xs text-gray-600">🌱 Score anti-spreco:</span>
        <div className="flex gap-1.5">
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">80+ Ottimo</span>
          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">40+ Buono</span>
          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">&lt;20 Scarso</span>
        </div>
      </div>

      {/* Lista ricette */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow-soft border border-cream-200">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="font-display font-semibold text-gray-700 text-lg">Nessuna ricetta trovata</p>
          <p className="text-sm text-gray-500 mt-1">
            {activeFiltersCount > 0
              ? 'Prova a rimuovere qualche filtro.'
              : 'Aggiungi ingredienti al frigo per vedere le ricette!'
            }
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setSelectedTags([]); setOnlyAvailable(false) }}
              className="mt-4 px-5 py-2.5 bg-sage-500 text-white rounded-2xl text-sm font-medium hover:bg-sage-600 transition-colors"
            >
              Rimuovi filtri
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">{filtered.length} ricette trovate</p>
          {filtered.map(recipe => (
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
