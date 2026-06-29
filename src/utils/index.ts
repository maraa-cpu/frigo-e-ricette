import type { Ingredient, EnrichedRecipe, Recipe } from '../types'
import { EXPIRATION_THRESHOLDS } from '../data/constants'

/** Genera un ID univoco */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Calcola i giorni alla scadenza di un ingrediente */
export function daysUntilExpiration(expirationDate: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const exp = new Date(expirationDate)
  exp.setHours(0, 0, 0, 0)
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

/** Ritorna true se l'ingrediente è scaduto */
export function isExpired(ingredient: Ingredient): boolean {
  if (!ingredient.expirationDate) return false
  return daysUntilExpiration(ingredient.expirationDate) < 0
}

/** Ritorna true se l'ingrediente sta per scadere */
export function isExpiringSoon(ingredient: Ingredient, days = EXPIRATION_THRESHOLDS.SOON): boolean {
  if (!ingredient.expirationDate) return false
  const d = daysUntilExpiration(ingredient.expirationDate)
  return d >= 0 && d <= days
}

/** Etichetta leggibile per scadenza */
export function expirationLabel(days: number): string {
  if (days < 0) return 'Scaduto'
  if (days === 0) return 'Scade oggi'
  if (days === 1) return 'Scade domani'
  if (days <= 7) return `Scade in ${days} giorni`
  return `Scade tra ${days} giorni`
}

/** Colore badge scadenza */
export function expirationColor(days: number): string {
  if (days < 0) return 'bg-red-100 text-red-700 border-red-200'
  if (days <= EXPIRATION_THRESHOLDS.URGENT) return 'bg-red-100 text-red-700 border-red-200'
  if (days <= EXPIRATION_THRESHOLDS.WARNING) return 'bg-orange-100 text-orange-700 border-orange-200'
  if (days <= EXPIRATION_THRESHOLDS.SOON) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  return 'bg-green-100 text-green-700 border-green-200'
}

/** Normalizza una stringa per confronto (lowercase, trim) */
export function normalize(s: string): string {
  return s.toLowerCase().trim()
}

/**
 * Calcola lo score anti-spreco per una ricetta (0-100).
 *
 * Fattori:
 * - Ingredienti disponibili: +50 punti (proporzionale)
 * - Ingredienti in scadenza consumati: +30 punti (proporzionale)
 * - Ingredienti mancanti: -20 punti (proporzionale)
 * - Tempo di preparazione: bonus fino a +5 (piatti veloci)
 */
export function computeAntiWasteScore(
  recipe: Recipe,
  ingredients: Ingredient[]
): { score: number; available: string[]; missing: string[]; expiring: string[] } {
  const ingredientNames = ingredients.map(i => normalize(i.name))
  const expiringIngredients = ingredients
    .filter(i => i.expirationDate && isExpiringSoon(i, EXPIRATION_THRESHOLDS.WARNING))
    .map(i => normalize(i.name))

  const available: string[] = []
  const missing: string[] = []
  const expiring: string[] = []

  for (const ri of recipe.ingredients) {
    const riName = normalize(ri.name)
    // Ignora ingredienti base come sale, pepe, acqua
    if (['sale', 'pepe', 'acqua', 'zucchero'].includes(riName)) {
      available.push(ri.name)
      continue
    }
    const found = ingredientNames.some(n => n.includes(riName) || riName.includes(n))
    if (found) {
      available.push(ri.name)
      if (expiringIngredients.some(n => n.includes(riName) || riName.includes(n))) {
        expiring.push(ri.name)
      }
    } else if (!ri.optional) {
      missing.push(ri.name)
    }
  }

  const totalRequired = recipe.ingredients.filter(i => !i.optional).length || 1
  const availableRatio = available.length / totalRequired
  const expiringRatio = expiring.length / Math.max(expiringIngredients.length, 1)
  const missingRatio = missing.length / totalRequired

  let score = 0
  score += availableRatio * 50
  score += expiringRatio * 30
  score -= missingRatio * 20

  // Bonus velocità (max 5 punti per ricette < 20 min)
  const totalTime = recipe.prepTime + recipe.cookTime
  if (totalTime <= 15) score += 5
  else if (totalTime <= 30) score += 3
  else if (totalTime <= 45) score += 1

  score = Math.round(Math.max(0, Math.min(100, score)))

  return { score, available, missing, expiring }
}

/** Arricchisce le ricette con score e analisi ingredienti */
export function enrichRecipes(recipes: Recipe[], ingredients: Ingredient[]): EnrichedRecipe[] {
  return recipes
    .map(recipe => {
      const { score, available, missing, expiring } = computeAntiWasteScore(recipe, ingredients)
      return {
        ...recipe,
        availableIngredients: available,
        missingIngredients: missing,
        expiringIngredients: expiring,
        antiWasteScore: score,
      }
    })
    .sort((a, b) => b.antiWasteScore - a.antiWasteScore)
}

/** Formatta i minuti come stringa leggibile */
export function formatTime(minutes: number): string {
  if (minutes === 0) return 'Nessuna cottura'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

/** Formatta una data ISO in italiano */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Colore badge score anti-spreco */
export function scoreColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-700', label: 'Ottimo' }
  if (score >= 60) return { bg: 'bg-lime-100', text: 'text-lime-700', label: 'Buono' }
  if (score >= 40) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Discreto' }
  if (score >= 20) return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Scarso' }
  return { bg: 'bg-red-100', text: 'text-red-700', label: 'Poco conveniente' }
}
