/** Pagina Spesa - Lista della spesa intelligente */
import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, X } from 'lucide-react'
import { useAppContext } from '../hooks/useAppContext'
import type { ShoppingItem } from '../types'

export function SpesaPage() {
  const {
    state,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    clearCheckedShopping,
  } = useAppContext()
  const { shoppingList } = state

  const [newItem, setNewItem] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newItem.trim()
    if (!name) return
    addShoppingItem({ name, checked: false })
    setNewItem('')
  }

  const unchecked = shoppingList.filter(i => !i.checked)
  const checked = shoppingList.filter(i => i.checked)

  // Raggruppa per ricetta
  const byRecipe = new Map<string, ShoppingItem[]>()
  const manual: ShoppingItem[] = []
  for (const item of unchecked) {
    if (item.fromRecipeId && item.fromRecipeName) {
      const arr = byRecipe.get(item.fromRecipeName) || []
      arr.push(item)
      byRecipe.set(item.fromRecipeName, arr)
    } else {
      manual.push(item)
    }
  }

  const total = shoppingList.length
  const checkedCount = checked.length
  const progress = total > 0 ? Math.round((checkedCount / total) * 100) : 0

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-gray-800 text-2xl">Lista della spesa</h1>
        <p className="text-sm text-gray-500">
          {total === 0 ? 'Nessun articolo' : `${checkedCount}/${total} acquistati`}
        </p>
      </div>

      {/* Barra progresso */}
      {total > 0 && (
        <div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress}% completato</p>
        </div>
      )}

      {/* Input aggiunta */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Aggiungi prodotto..."
          className="flex-1 px-4 py-3 rounded-2xl border border-cream-200 bg-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm text-gray-800 placeholder-gray-400"
          id="input-spesa"
        />
        <button
          type="submit"
          disabled={!newItem.trim()}
          className="flex items-center gap-1.5 px-4 py-3 bg-sage-500 text-white rounded-2xl text-sm font-medium hover:bg-sage-600 disabled:opacity-40 transition-colors"
        >
          <Plus size={18} />
        </button>
      </form>

      {/* Lista vuota */}
      {total === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center shadow-soft border border-cream-200">
          <p className="text-5xl mb-4">🛒</p>
          <p className="font-display font-semibold text-gray-700 text-lg">Lista vuota!</p>
          <p className="text-sm text-gray-500 mt-1">
            Aggiungi prodotti manualmente o genera la lista da una ricetta nella sezione Ricette.
          </p>
        </div>
      )}

      {/* Da ricette */}
      {Array.from(byRecipe.entries()).map(([recipeName, items]) => (
        <section key={recipeName}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-sage-700 bg-sage-50 px-2.5 py-1 rounded-full">
              🍽️ {recipeName}
            </span>
          </div>
          <div className="space-y-2">
            {items.map(item => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                onToggle={() => toggleShoppingItem(item.id)}
                onDelete={() => deleteShoppingItem(item.id)}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Manuale */}
      {manual.length > 0 && (
        <section>
          {byRecipe.size > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                📝 Aggiunti manualmente
              </span>
            </div>
          )}
          <div className="space-y-2">
            {manual.map(item => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                onToggle={() => toggleShoppingItem(item.id)}
                onDelete={() => deleteShoppingItem(item.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Acquistati */}
      {checked.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              ✅ Acquistati ({checked.length})
            </span>
            <button
              onClick={clearCheckedShopping}
              className="text-xs text-red-400 flex items-center gap-1 hover:text-red-600 transition-colors"
            >
              <Trash2 size={12} /> Rimuovi tutti
            </button>
          </div>
          <div className="space-y-2 opacity-60">
            {checked.map(item => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                onToggle={() => toggleShoppingItem(item.id)}
                onDelete={() => deleteShoppingItem(item.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Spazio navbar */}
      <div className="h-4" />
    </div>
  )
}

/** Riga singolo elemento lista spesa */
function ShoppingItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: ShoppingItem
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={`flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-soft border transition-all
        ${item.checked ? 'border-green-100 bg-green-50/30' : 'border-cream-200'}`}
    >
      <button
        onClick={onToggle}
        className={`flex-shrink-0 transition-colors ${
          item.checked ? 'text-green-500' : 'text-gray-300 hover:text-sage-400'
        }`}
        aria-label={item.checked ? 'Deseleziona' : 'Segna come acquistato'}
      >
        {item.checked ? <CheckCircle2 size={22} /> : <Circle size={22} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {item.name}
        </p>
        {item.quantity && (
          <p className="text-xs text-gray-400">{item.quantity} {item.unit}</p>
        )}
      </div>
      <button
        onClick={onDelete}
        className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
        aria-label="Rimuovi"
      >
        <X size={15} />
      </button>
    </div>
  )
}
