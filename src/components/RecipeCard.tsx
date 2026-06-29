/** Card ricetta con score anti-spreco e azioni */
import { useState } from 'react'
import { Heart, Clock, ChefHat, ShoppingCart, ChevronDown, ChevronUp, Leaf } from 'lucide-react'
import type { EnrichedRecipe } from '../types'
import { AntiWasteScoreBadge } from './AntiWasteScoreBadge'
import { formatTime, scoreColor } from '../utils'

const TAG_LABELS: Record<string, string> = {
  'veloce': '⚡ Veloce',
  'economica': '💰 Economica',
  'svuota-frigo': '🧹 Svuota frigo',
  'vegetariana': '🥦 Vegetariana',
  'proteica': '💪 Proteica',
  'vegana': '🌱 Vegana',
  'cena-leggera': '🌙 Cena leggera',
  'pranzo-veloce': '☀️ Pranzo veloce',
  'pochi-ingredienti': '🎯 Pochi ingredienti',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  facile: 'Facile',
  media: 'Media',
  difficile: 'Difficile',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  facile: 'text-green-600 bg-green-50',
  media: 'text-amber-600 bg-amber-50',
  difficile: 'text-red-600 bg-red-50',
}

interface RecipeCardProps {
  recipe: EnrichedRecipe
  isFavorite: boolean
  onToggleFavorite: () => void
  onAddToShoppingList: () => void
}

export function RecipeCard({
  recipe,
  isFavorite,
  onToggleFavorite,
  onAddToShoppingList,
}: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { bg: scoreBg, text: scoreText } = scoreColor(recipe.antiWasteScore)

  return (
    <article className="bg-white rounded-3xl shadow-soft border border-cream-200 overflow-hidden animate-fade-in">
      {/* Header colorato con score */}
      <div className={`px-4 pt-4 pb-3 ${scoreBg} bg-opacity-30`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-display font-semibold text-gray-800 text-lg leading-tight">
              {recipe.title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{recipe.description}</p>
          </div>
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-2xl transition-all duration-200 flex-shrink-0
              ${isFavorite
                ? 'bg-red-100 text-red-500 scale-110'
                : 'bg-white/70 text-gray-400 hover:text-red-400 hover:bg-red-50'
              }`}
            aria-label={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Meta info */}
        <div className="flex items-center flex-wrap gap-2 mt-3">
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <Clock size={13} />
            {formatTime(recipe.prepTime + recipe.cookTime)}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[recipe.difficulty]}`}>
            <ChefHat size={11} className="inline mr-0.5" />
            {DIFFICULTY_LABELS[recipe.difficulty]}
          </span>
          <span className="text-xs text-gray-500">
            👥 {recipe.servings} porzioni
          </span>
        </div>
      </div>

      {/* Score anti-spreco */}
      <div className="px-4 py-2.5 border-b border-cream-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf size={14} className={scoreText} />
          <span className="text-xs text-gray-600">Score anti-spreco</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                recipe.antiWasteScore >= 70 ? 'bg-green-400' :
                recipe.antiWasteScore >= 40 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${recipe.antiWasteScore}%` }}
            />
          </div>
          <AntiWasteScoreBadge score={recipe.antiWasteScore} showLabel={false} />
        </div>
      </div>

      {/* Ingredienti disponibili/mancanti */}
      <div className="px-4 py-3 space-y-2">
        {recipe.availableIngredients.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold text-green-700 uppercase tracking-wide">
              ✓ Hai già ({recipe.availableIngredients.length})
            </span>
            <p className="text-xs text-gray-600 mt-0.5">
              {recipe.availableIngredients.slice(0, 5).join(', ')}
              {recipe.availableIngredients.length > 5 ? '...' : ''}
            </p>
          </div>
        )}
        {recipe.missingIngredients.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">
              ✗ Mancano ({recipe.missingIngredients.length})
            </span>
            <p className="text-xs text-gray-600 mt-0.5">
              {recipe.missingIngredients.join(', ')}
            </p>
          </div>
        )}
        {recipe.expiringIngredients.length > 0 && (
          <div className="bg-amber-50 rounded-xl px-2.5 py-1.5">
            <span className="text-[11px] font-semibold text-amber-700">
              ⚠️ Usa prima: {recipe.expiringIngredients.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {recipe.tags.map(tag => (
            <span
              key={tag}
              className="text-[10px] bg-cream-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {TAG_LABELS[tag] || tag}
            </span>
          ))}
        </div>
      )}

      {/* Procedimento espandibile */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-cream-100 pt-3 animate-fade-in">
          <h4 className="font-semibold text-sm text-gray-700">📋 Ingredienti completi:</h4>
          <ul className="space-y-1">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0" />
                <span>
                  {ing.quantity} {ing.unit} {ing.name}
                  {ing.optional && <span className="text-gray-400 text-xs ml-1">(opz.)</span>}
                </span>
              </li>
            ))}
          </ul>

          <h4 className="font-semibold text-sm text-gray-700 mt-4">👨‍🍳 Procedimento:</h4>
          <ol className="space-y-3">
            {recipe.steps.map(step => (
              <li key={step.step} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage-100 text-sage-600 text-xs font-bold flex items-center justify-center">
                  {step.step}
                </span>
                <div>
                  <p className="text-sm text-gray-700">{step.description}</p>
                  {step.duration && (
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      ⏱ {step.duration} min
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-sage-200 text-sage-600 text-sm font-medium hover:bg-sage-50 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp size={16} /> Nascondi
            </>
          ) : (
            <>
              <ChevronDown size={16} /> Vedi ricetta
            </>
          )}
        </button>
        {recipe.missingIngredients.length > 0 && (
          <button
            onClick={onAddToShoppingList}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-terracotta-400 text-white text-sm font-medium hover:bg-terracotta-500 transition-colors"
          >
            <ShoppingCart size={16} />
            Aggiungi
          </button>
        )}
      </div>
    </article>
  )
}
