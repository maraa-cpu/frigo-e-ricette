/** Pagina Frigo - Gestione ingredienti */
import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useAppContext } from '../hooks/useAppContext'
import { IngredientModal } from '../components/IngredientModal'
import { ExpirationBadge } from '../components/ExpirationBadge'
import { CATEGORY_LABELS, CATEGORY_EMOJI, CATEGORY_COLORS } from '../data/constants'
import { isExpiringSoon, isExpired, daysUntilExpiration } from '../utils'
import type { Ingredient, IngredientCategory } from '../types'

export function FrigoPage() {
  const { state, addIngredient, updateIngredient, deleteIngredient } = useAppContext()
  const { ingredients } = state

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'tutti'>('tutti')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)

  // Filtraggio
  const filtered = useMemo(() => {
    return ingredients.filter(ing => {
      const matchSearch = !search || ing.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = selectedCategory === 'tutti' || ing.category === selectedCategory
      return matchSearch && matchCat
    })
  }, [ingredients, search, selectedCategory])

  // Raggruppa per categoria
  const grouped = useMemo(() => {
    const map = new Map<IngredientCategory, Ingredient[]>()
    for (const ing of filtered) {
      const arr = map.get(ing.category) || []
      arr.push(ing)
      map.set(ing.category, arr)
    }
    return map
  }, [filtered])

  const categories = Array.from(new Set(ingredients.map(i => i.category)))

  const handleEdit = (ing: Ingredient) => {
    setEditingIngredient(ing)
    setModalOpen(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Rimuovere "${name}" dal frigo?`)) {
      deleteIngredient(id)
    }
  }

  const handleSave = (data: Omit<Ingredient, 'id' | 'addedAt'>) => {
    if (editingIngredient) {
      updateIngredient({ ...editingIngredient, ...data })
    } else {
      addIngredient(data)
    }
    setEditingIngredient(null)
  }

  // Conta scadenze
  const expiringCount = ingredients.filter(
    i => i.expirationDate && isExpiringSoon(i, 5) && !isExpired(i)
  ).length

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-gray-800 text-2xl">Il mio frigo</h1>
          <p className="text-sm text-gray-500">
            {ingredients.length} ingredienti
            {expiringCount > 0 && (
              <span className="text-amber-600 ml-2">⚠️ {expiringCount} in scadenza</span>
            )}
          </p>
        </div>
        <button
          onClick={() => { setEditingIngredient(null); setModalOpen(true) }}
          id="btn-add-ingredient"
          className="flex items-center gap-2 bg-sage-500 text-white px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-sage-600 transition-colors shadow-soft"
        >
          <Plus size={18} />
          Aggiungi
        </button>
      </div>

      {/* Ricerca */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca ingredienti..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-cream-200 bg-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Filtro categoria */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('tutti')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${selectedCategory === 'tutti'
                ? 'bg-sage-500 text-white'
                : 'bg-white border border-cream-200 text-gray-600 hover:border-sage-300'
              }`}
          >
            Tutti
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${selectedCategory === cat
                  ? 'bg-sage-500 text-white'
                  : 'bg-white border border-cream-200 text-gray-600 hover:border-sage-300'
                }`}
            >
              {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat].split(',')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Lista ingredienti */}
      {ingredients.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow-soft border border-cream-200">
          <p className="text-5xl mb-4">🌿</p>
          <p className="font-display font-semibold text-gray-700 text-lg">Frigo vuoto!</p>
          <p className="text-sm text-gray-500 mt-1">
            Aggiungi i tuoi ingredienti per ricevere suggerimenti di ricette personalizzati.
          </p>
          <button
            onClick={() => { setEditingIngredient(null); setModalOpen(true) }}
            className="mt-5 px-6 py-3 bg-sage-500 text-white rounded-2xl text-sm font-medium hover:bg-sage-600 transition-colors"
          >
            Aggiungi il primo ingrediente
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-gray-500">Nessun risultato per "{search}"</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Array.from(grouped.entries()).map(([category, items]) => {
            const colors = CATEGORY_COLORS[category]
            return (
              <section key={category}>
                <div className={`flex items-center gap-2 mb-2.5`}>
                  <span className="text-lg">{CATEGORY_EMOJI[category]}</span>
                  <h2 className="font-semibold text-sm text-gray-700">{CATEGORY_LABELS[category]}</h2>
                  <span className="text-xs text-gray-400">({items.length})</span>
                </div>
                <div className="space-y-2">
                  {items.map(ing => {
                    const expired = ing.expirationDate && isExpired(ing)
                    const expiring = ing.expirationDate && isExpiringSoon(ing, 5)
                    const days = ing.expirationDate ? daysUntilExpiration(ing.expirationDate) : null

                    return (
                      <div
                        key={ing.id}
                        className={`bg-white rounded-2xl px-4 py-3 shadow-soft border transition-all
                          ${expired ? 'border-red-200 bg-red-50/30' :
                            expiring ? 'border-amber-200 bg-amber-50/30' :
                            'border-cream-200'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${colors.bg}`}>
                            {CATEGORY_EMOJI[ing.category]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-800 text-sm">{ing.name}</p>
                              {expired && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">Scaduto</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-gray-500">{ing.quantity} {ing.unit}</span>
                              {ing.notes && <span className="text-xs text-gray-400">· {ing.notes}</span>}
                              {ing.expirationDate && days !== null && (
                                <ExpirationBadge expirationDate={ing.expirationDate} small />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleEdit(ing)}
                              className="p-2 rounded-xl text-gray-400 hover:text-sage-600 hover:bg-sage-50 transition-colors"
                              aria-label="Modifica"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(ing.id, ing.name)}
                              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              aria-label="Elimina"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* Spazio navbar */}
      <div className="h-4" />

      {/* Modale */}
      <IngredientModal
        isOpen={modalOpen}
        ingredient={editingIngredient}
        onClose={() => { setModalOpen(false); setEditingIngredient(null) }}
        onSave={handleSave}
      />
    </div>
  )
}
