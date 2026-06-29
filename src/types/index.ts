// ============================================================
// TIPI PRINCIPALI DELL'APP - Frigo & Ricette
// ============================================================

/** Categorie ingredienti supportate */
export type IngredientCategory =
  | 'verdura'
  | 'frutta'
  | 'carne'
  | 'pesce'
  | 'latticini'
  | 'pasta-riso-cereali'
  | 'legumi'
  | 'condimenti'
  | 'altro'

/** Unità di misura */
export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'pz' | 'cucchiaio' | 'tazza' | 'qb'

/** Singolo ingrediente nel frigo */
export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  quantity: number
  unit: Unit
  expirationDate?: string // ISO date string
  addedAt: string // ISO date string
  notes?: string
}

/** Tag ricetta */
export type RecipeTag =
  | 'veloce'
  | 'economica'
  | 'svuota-frigo'
  | 'vegetariana'
  | 'proteica'
  | 'vegana'
  | 'cena-leggera'
  | 'pranzo-veloce'
  | 'pochi-ingredienti'

/** Difficoltà ricetta */
export type Difficulty = 'facile' | 'media' | 'difficile'

/** Ingrediente nella ricetta */
export interface RecipeIngredient {
  name: string
  quantity: number
  unit: Unit
  optional?: boolean
}

/** Passo della ricetta */
export interface RecipeStep {
  step: number
  description: string
  duration?: number // minuti
}

/** Ricetta completa */
export interface Recipe {
  id: string
  title: string
  description: string
  prepTime: number // minuti
  cookTime: number // minuti
  servings: number
  difficulty: Difficulty
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  tags: RecipeTag[]
  image?: string
  createdAt: string
  isDemo?: boolean
}

/** Ricetta arricchita con score e ingredienti analizzati */
export interface EnrichedRecipe extends Recipe {
  availableIngredients: string[]   // ingredienti che hai
  missingIngredients: string[]     // ingredienti che mancano
  expiringIngredients: string[]    // ingredienti in scadenza usati
  antiWasteScore: number           // 0-100
}

/** Elemento lista della spesa */
export interface ShoppingItem {
  id: string
  name: string
  quantity?: number
  unit?: Unit
  category?: IngredientCategory
  checked: boolean
  fromRecipeId?: string
  fromRecipeName?: string
  addedAt: string
}

/** Preferenze utente */
export interface UserPreference {
  dietaryRestrictions: string[]      // es. 'vegetariano', 'vegano', 'senza glutine'
  favoriteCategories: IngredientCategory[]
  defaultServings: number
  notifyBeforeExpiration: number     // giorni prima
  aiEnabled: boolean
}

/** Messaggio per la chat ChefBot */
export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  isError?: boolean
  isOffline?: boolean
}

/** Stato dell'app (root) */
export interface AppState {
  ingredients: Ingredient[]
  favorites: string[]               // Recipe IDs
  shoppingList: ShoppingItem[]
  preferences: UserPreference
  chatHistory: AIMessage[]
  lastUpdated: string
}

/** Filtri ricetta */
export interface RecipeFilters {
  tags: RecipeTag[]
  maxPrepTime?: number
  difficulty?: Difficulty
  onlyAvailable: boolean            // solo ricette con ingredienti disponibili
}
