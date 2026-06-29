import type { IngredientCategory } from '../types'

/** Etichette leggibili per le categorie */
export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  'verdura': 'Verdura',
  'frutta': 'Frutta',
  'carne': 'Carne',
  'pesce': 'Pesce',
  'latticini': 'Latticini',
  'pasta-riso-cereali': 'Pasta, Riso & Cereali',
  'legumi': 'Legumi',
  'condimenti': 'Condimenti',
  'altro': 'Altro',
}

/** Emoji per le categorie */
export const CATEGORY_EMOJI: Record<IngredientCategory, string> = {
  'verdura': '🥦',
  'frutta': '🍎',
  'carne': '🥩',
  'pesce': '🐟',
  'latticini': '🧀',
  'pasta-riso-cereali': '🍝',
  'legumi': '🫘',
  'condimenti': '🫒',
  'altro': '📦',
}

/** Colori card per le categorie */
export const CATEGORY_COLORS: Record<IngredientCategory, { bg: string; text: string; border: string }> = {
  'verdura': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'frutta': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'carne': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'pesce': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'latticini': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'pasta-riso-cereali': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'legumi': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  'condimenti': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'altro': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
}

/** Soglie scadenza in giorni */
export const EXPIRATION_THRESHOLDS = {
  URGENT: 2,    // rosso
  WARNING: 5,   // arancione
  SOON: 10,     // giallo
}
