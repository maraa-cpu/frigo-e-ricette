/**
 * Storage Service - Frigo & Ricette
 * Gestisce il salvataggio dei dati via LocalStorage.
 * In futuro può essere sostituito con IndexedDB.
 */

import type { AppState, Ingredient, ShoppingItem, UserPreference, AIMessage } from '../types'
import { demoIngredients } from '../data/demoIngredients'

const STORAGE_KEY = 'frigo-e-ricette'

const defaultPreferences: UserPreference = {
  dietaryRestrictions: [],
  favoriteCategories: [],
  defaultServings: 2,
  notifyBeforeExpiration: 3,
  aiEnabled: true,
}

const defaultState: AppState = {
  ingredients: demoIngredients,
  favorites: ['recipe-2', 'recipe-4'], // Preferiti demo
  shoppingList: [],
  preferences: defaultPreferences,
  chatHistory: [],
  lastUpdated: new Date().toISOString(),
}

/** Carica lo stato dell'app da LocalStorage */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as AppState
    // Merge con defaults per campi mancanti
    return {
      ...defaultState,
      ...parsed,
      preferences: { ...defaultPreferences, ...(parsed.preferences || {}) },
    }
  } catch {
    return defaultState
  }
}

/** Salva lo stato completo */
export function saveState(state: AppState): void {
  try {
    const toSave: AppState = {
      ...state,
      lastUpdated: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.error('[Storage] Errore nel salvataggio:', e)
  }
}

/** Salva solo gli ingredienti */
export function saveIngredients(state: AppState, ingredients: Ingredient[]): AppState {
  const newState = { ...state, ingredients }
  saveState(newState)
  return newState
}

/** Salva i preferiti */
export function saveFavorites(state: AppState, favorites: string[]): AppState {
  const newState = { ...state, favorites }
  saveState(newState)
  return newState
}

/** Salva la lista della spesa */
export function saveShoppingList(state: AppState, shoppingList: ShoppingItem[]): AppState {
  const newState = { ...state, shoppingList }
  saveState(newState)
  return newState
}

/** Salva le preferenze */
export function savePreferences(state: AppState, preferences: UserPreference): AppState {
  const newState = { ...state, preferences }
  saveState(newState)
  return newState
}

/** Salva la storia della chat */
export function saveChatHistory(state: AppState, chatHistory: AIMessage[]): AppState {
  // Mantieni solo gli ultimi 50 messaggi
  const trimmed = chatHistory.slice(-50)
  const newState = { ...state, chatHistory: trimmed }
  saveState(newState)
  return newState
}

/** Reset completo ai dati demo */
export function resetToDemo(): AppState {
  saveState(defaultState)
  return defaultState
}
