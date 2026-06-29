/** Modale per aggiungere/modificare un ingrediente */
import React, { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import type { Ingredient, IngredientCategory, Unit } from '../types'
import { CATEGORY_LABELS, CATEGORY_EMOJI } from '../data/constants'

interface IngredientModalProps {
  isOpen: boolean
  ingredient?: Ingredient | null
  onClose: () => void
  onSave: (ingredient: Omit<Ingredient, 'id' | 'addedAt'>) => void
}

const UNITS: Unit[] = ['g', 'kg', 'ml', 'l', 'pz', 'cucchiaio', 'tazza', 'qb']
const CATEGORIES = Object.keys(CATEGORY_LABELS) as IngredientCategory[]

export function IngredientModal({ isOpen, ingredient, onClose, onSave }: IngredientModalProps) {
  const [form, setForm] = useState({
    name: '',
    category: 'altro' as IngredientCategory,
    quantity: 1,
    unit: 'pz' as Unit,
    expirationDate: '',
    notes: '',
  })

  useEffect(() => {
    if (ingredient) {
      setForm({
        name: ingredient.name,
        category: ingredient.category,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        expirationDate: ingredient.expirationDate || '',
        notes: ingredient.notes || '',
      })
    } else {
      setForm({ name: '', category: 'altro', quantity: 1, unit: 'pz', expirationDate: '', notes: '' })
    }
  }, [ingredient, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      name: form.name.trim(),
      category: form.category,
      quantity: form.quantity,
      unit: form.unit,
      expirationDate: form.expirationDate || undefined,
      notes: form.notes || undefined,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-cream-200">
          <h2 className="font-display font-semibold text-gray-800 text-lg">
            {ingredient ? '✏️ Modifica ingrediente' : '➕ Nuovo ingrediente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome ingrediente *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="es. Pasta, Pomodori..."
              className="w-full px-4 py-3 rounded-2xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent text-gray-800 placeholder-gray-400"
              required
              autoFocus
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat }))}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl border text-xs font-medium transition-all
                    ${form.category === cat
                      ? 'border-sage-400 bg-sage-50 text-sage-700'
                      : 'border-cream-200 bg-white text-gray-600 hover:border-sage-200'
                    }`}
                >
                  <span className="text-lg">{CATEGORY_EMOJI[cat]}</span>
                  <span className="text-center leading-tight">{CATEGORY_LABELS[cat].split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantità e unità */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantità</label>
              <input
                type="number"
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                min={0}
                step={0.1}
                className="w-full px-4 py-3 rounded-2xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400 text-gray-800"
              />
            </div>
            <div className="w-28">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Unità</label>
              <select
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value as Unit }))}
                className="w-full px-3 py-3 rounded-2xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400 text-gray-800 bg-white"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Data scadenza */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Data di scadenza
              <span className="text-gray-400 font-normal ml-1">(opzionale)</span>
            </label>
            <input
              type="date"
              value={form.expirationDate}
              onChange={e => setForm(f => ({ ...f, expirationDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-2xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400 text-gray-800"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Note
              <span className="text-gray-400 font-normal ml-1">(opzionale)</span>
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="es. In scatola, biologico..."
              className="w-full px-4 py-3 rounded-2xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400 text-gray-800 placeholder-gray-400"
            />
          </div>

          {/* Bottoni */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {ingredient ? 'Aggiorna' : 'Aggiungi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
