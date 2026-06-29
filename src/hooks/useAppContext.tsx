/**
 * AppContext - Stato globale dell'app Frigo & Ricette
 * Gestisce ingredienti, preferiti, lista della spesa e chat ChefBot.
 */
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import type {
  AppState,
  Ingredient,
  ShoppingItem,
  UserPreference,
  AIMessage,
} from '../types'
import {
  loadState,
  saveIngredients,
  saveFavorites,
  saveShoppingList,
  savePreferences,
  saveChatHistory,
  resetToDemo,
} from '../services/storage'
import { generateId } from '../utils'

// ============================================================
// TIPI AZIONI
// ============================================================
type Action =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'ADD_INGREDIENT'; payload: Omit<Ingredient, 'id' | 'addedAt'> }
  | { type: 'UPDATE_INGREDIENT'; payload: Ingredient }
  | { type: 'DELETE_INGREDIENT'; payload: string }
  | { type: 'CLEAR_FRIDGE' }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'ADD_SHOPPING_ITEM'; payload: Omit<ShoppingItem, 'id' | 'addedAt'> }
  | { type: 'ADD_SHOPPING_ITEMS'; payload: Omit<ShoppingItem, 'id' | 'addedAt'>[] }
  | { type: 'TOGGLE_SHOPPING_ITEM'; payload: string }
  | { type: 'DELETE_SHOPPING_ITEM'; payload: string }
  | { type: 'CLEAR_CHECKED_SHOPPING' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreference> }
  | { type: 'ADD_CHAT_MESSAGE'; payload: AIMessage }
  | { type: 'CLEAR_CHAT' }
  | { type: 'RESET_TO_DEMO' }

// ============================================================
// REDUCER
// ============================================================
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload

    case 'ADD_INGREDIENT': {
      const newIngredient: Ingredient = {
        ...action.payload,
        id: generateId(),
        addedAt: new Date().toISOString(),
      }
      const newState = { ...state, ingredients: [...state.ingredients, newIngredient] }
      return saveIngredients(newState, newState.ingredients)
    }

    case 'UPDATE_INGREDIENT': {
      const ingredients = state.ingredients.map(i =>
        i.id === action.payload.id ? action.payload : i
      )
      const newState = { ...state, ingredients }
      return saveIngredients(newState, ingredients)
    }

    case 'DELETE_INGREDIENT': {
      const ingredients = state.ingredients.filter(i => i.id !== action.payload)
      const newState = { ...state, ingredients }
      return saveIngredients(newState, ingredients)
    }

    case 'CLEAR_FRIDGE': {
      const newState = { ...state, ingredients: [] }
      return saveIngredients(newState, [])
    }

    case 'TOGGLE_FAVORITE': {
      const id = action.payload
      const favorites = state.favorites.includes(id)
        ? state.favorites.filter(f => f !== id)
        : [...state.favorites, id]
      const newState = { ...state, favorites }
      return saveFavorites(newState, favorites)
    }

    case 'ADD_SHOPPING_ITEM': {
      const newItem: ShoppingItem = {
        ...action.payload,
        id: generateId(),
        addedAt: new Date().toISOString(),
      }
      const shoppingList = [...state.shoppingList, newItem]
      const newState = { ...state, shoppingList }
      return saveShoppingList(newState, shoppingList)
    }

    case 'ADD_SHOPPING_ITEMS': {
      const newItems: ShoppingItem[] = action.payload.map(item => ({
        ...item,
        id: generateId(),
        addedAt: new Date().toISOString(),
      }))
      const shoppingList = [...state.shoppingList, ...newItems]
      const newState = { ...state, shoppingList }
      return saveShoppingList(newState, shoppingList)
    }

    case 'TOGGLE_SHOPPING_ITEM': {
      const shoppingList = state.shoppingList.map(item =>
        item.id === action.payload ? { ...item, checked: !item.checked } : item
      )
      const newState = { ...state, shoppingList }
      return saveShoppingList(newState, shoppingList)
    }

    case 'DELETE_SHOPPING_ITEM': {
      const shoppingList = state.shoppingList.filter(i => i.id !== action.payload)
      const newState = { ...state, shoppingList }
      return saveShoppingList(newState, shoppingList)
    }

    case 'CLEAR_CHECKED_SHOPPING': {
      const shoppingList = state.shoppingList.filter(i => !i.checked)
      const newState = { ...state, shoppingList }
      return saveShoppingList(newState, shoppingList)
    }

    case 'UPDATE_PREFERENCES': {
      const preferences = { ...state.preferences, ...action.payload }
      const newState = { ...state, preferences }
      return savePreferences(newState, preferences)
    }

    case 'ADD_CHAT_MESSAGE': {
      const chatHistory = [...state.chatHistory, action.payload]
      const newState = { ...state, chatHistory }
      return saveChatHistory(newState, chatHistory)
    }

    case 'CLEAR_CHAT': {
      const newState = { ...state, chatHistory: [] }
      return saveChatHistory(newState, [])
    }

    case 'RESET_TO_DEMO':
      return resetToDemo()

    default:
      return state
  }
}

// ============================================================
// CONTEXT
// ============================================================
interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  // Shortcut helpers
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'addedAt'>) => void
  updateIngredient: (ingredient: Ingredient) => void
  deleteIngredient: (id: string) => void
  clearFridge: () => void
  toggleFavorite: (recipeId: string) => void
  isFavorite: (recipeId: string) => boolean
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'addedAt'>) => void
  addShoppingItems: (items: Omit<ShoppingItem, 'id' | 'addedAt'>[]) => void
  toggleShoppingItem: (id: string) => void
  deleteShoppingItem: (id: string) => void
  clearCheckedShopping: () => void
  addChatMessage: (message: Omit<AIMessage, 'id' | 'timestamp'>) => void
  clearChat: () => void
  resetToDemo: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

// ============================================================
// PROVIDER
// ============================================================
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState)

  useEffect(() => {
    const loaded = loadState()
    dispatch({ type: 'LOAD_STATE', payload: loaded })
  }, [])

  const addIngredient = useCallback(
    (ingredient: Omit<Ingredient, 'id' | 'addedAt'>) =>
      dispatch({ type: 'ADD_INGREDIENT', payload: ingredient }),
    []
  )

  const updateIngredient = useCallback(
    (ingredient: Ingredient) =>
      dispatch({ type: 'UPDATE_INGREDIENT', payload: ingredient }),
    []
  )

  const deleteIngredient = useCallback(
    (id: string) => dispatch({ type: 'DELETE_INGREDIENT', payload: id }),
    []
  )

  const clearFridge = useCallback(() => dispatch({ type: 'CLEAR_FRIDGE' }), [])

  const toggleFavorite = useCallback(
    (recipeId: string) => dispatch({ type: 'TOGGLE_FAVORITE', payload: recipeId }),
    []
  )

  const isFavorite = useCallback(
    (recipeId: string) => state.favorites.includes(recipeId),
    [state.favorites]
  )

  const addShoppingItem = useCallback(
    (item: Omit<ShoppingItem, 'id' | 'addedAt'>) =>
      dispatch({ type: 'ADD_SHOPPING_ITEM', payload: item }),
    []
  )

  const addShoppingItems = useCallback(
    (items: Omit<ShoppingItem, 'id' | 'addedAt'>[]) =>
      dispatch({ type: 'ADD_SHOPPING_ITEMS', payload: items }),
    []
  )

  const toggleShoppingItem = useCallback(
    (id: string) => dispatch({ type: 'TOGGLE_SHOPPING_ITEM', payload: id }),
    []
  )

  const deleteShoppingItem = useCallback(
    (id: string) => dispatch({ type: 'DELETE_SHOPPING_ITEM', payload: id }),
    []
  )

  const clearCheckedShopping = useCallback(
    () => dispatch({ type: 'CLEAR_CHECKED_SHOPPING' }),
    []
  )

  const addChatMessage = useCallback(
    (message: Omit<AIMessage, 'id' | 'timestamp'>) => {
      const full: AIMessage = {
        ...message,
        id: generateId(),
        timestamp: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: full })
    },
    []
  )

  const clearChat = useCallback(() => dispatch({ type: 'CLEAR_CHAT' }), [])

  const resetToDemoFn = useCallback(() => dispatch({ type: 'RESET_TO_DEMO' }), [])

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        clearFridge,
        toggleFavorite,
        isFavorite,
        addShoppingItem,
        addShoppingItems,
        toggleShoppingItem,
        deleteShoppingItem,
        clearCheckedShopping,
        addChatMessage,
        clearChat,
        resetToDemo: resetToDemoFn,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

/** Hook per accedere al contesto app */
export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext deve essere usato dentro AppProvider')
  return ctx
}
