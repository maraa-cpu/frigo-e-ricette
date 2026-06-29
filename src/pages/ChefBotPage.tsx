/** Pagina ChefBot - Assistente AI */
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, RotateCcw, Wifi, WifiOff, Sparkles } from 'lucide-react'
import { useAppContext } from '../hooks/useAppContext'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { sendMessageToChefBot } from '../services/aiService'
import { demoRecipes } from '../data/demoRecipes'
import type { AIMessage } from '../types'

/** Suggerimenti rapidi mostrati all'avvio */
const QUICK_SUGGESTIONS = [
  'Cosa cucino stasera?',
  'Cosa devo consumare prima?',
  'Cena veloce ed economica!',
  'Fammi un menù per 2 giorni',
  'Come sostituisco il latte?',
]

export function ChefBotPage() {
  const { state, addChatMessage, clearChat } = useAppContext()
  const { ingredients, chatHistory, favorites } = state
  const isOnline = useOnlineStatus()

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll automatico all'ultimo messaggio
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isLoading])

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return
    setInput('')

    // Aggiungi messaggio utente
    const userMsg: Omit<AIMessage, 'id' | 'timestamp'> = {
      role: 'user',
      content: message.trim(),
    }
    addChatMessage(userMsg)
    setIsLoading(true)

    try {
      // Costruisci contesto
      const favoriteRecipes = demoRecipes.filter(r => favorites.includes(r.id))
      const context = { ingredients, favorites: favoriteRecipes, isOnline }

      // Invia al servizio AI
      const reply = await sendMessageToChefBot(message.trim(), chatHistory, context)

      const botMsg: Omit<AIMessage, 'id' | 'timestamp'> = {
        role: 'assistant',
        content: reply,
        isOffline: !isOnline,
      }
      addChatMessage(botMsg)
    } catch (error) {
      const errorMsg: Omit<AIMessage, 'id' | 'timestamp'> = {
        role: 'assistant',
        content: '😅 Ops! Qualcosa è andato storto. Riprova tra poco.',
        isError: true,
      }
      addChatMessage(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    if (window.confirm('Cancellare la conversazione con ChefBot?')) {
      clearChat()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-soft">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-gray-800 text-lg">ChefBot</h1>
            <div className="flex items-center gap-1.5">
              {isOnline ? (
                <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                  <Wifi size={9} /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <WifiOff size={9} /> Offline
                </span>
              )}
              <span className="text-[10px] text-gray-300">·</span>
              <span className="text-[10px] text-gray-500">
                {ingredients.length} ingredienti nel frigo
              </span>
            </div>
          </div>
        </div>
        {chatHistory.length > 0 && (
          <button
            onClick={handleClear}
            className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors"
            title="Cancella conversazione"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      {/* Banner offline */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 mb-3 flex items-center gap-2 flex-shrink-0">
          <WifiOff size={14} className="text-amber-500" />
          <p className="text-xs text-amber-700">
            Sei offline: posso usare solo ricette salvate e suggerimenti base.
          </p>
        </div>
      )}

      {/* Messaggi */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {/* Messaggio benvenuto */}
        {chatHistory.length === 0 && (
          <div className="animate-slide-up">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={14} className="text-sage-600" />
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-3xl rounded-tl-none px-4 py-3 shadow-soft border border-cream-200">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    👨‍🍳 Ciao! Sono <strong>ChefBot</strong>, il tuo assistente culinario personale!
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Ho accesso al tuo frigo (<strong>{ingredients.length} ingredienti</strong>) e posso aiutarti a:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {['Suggerire ricette con quello che hai', 'Gestire le scadenze', 'Creare menu settimanali', 'Trovare sostituti agli ingredienti'].map(item => (
                      <li key={item} className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="text-sage-500">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Suggerimenti rapidi */}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <Sparkles size={11} /> Prova a chiedere:
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-xs bg-white border border-cream-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-sage-400 hover:text-sage-600 transition-all shadow-soft"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messaggi della chat */}
        {chatHistory.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot size={14} className="text-sage-600" />
            </div>
            <div className="bg-white rounded-3xl rounded-tl-none px-4 py-3 shadow-soft border border-cream-200">
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input) } }}
          placeholder="Chiedimi una ricetta, un consiglio..."
          className="flex-1 px-4 py-3 rounded-2xl border border-cream-200 bg-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm text-gray-800 placeholder-gray-400"
          id="input-chefbot"
          disabled={isLoading}
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isLoading}
          className="flex items-center gap-1.5 px-4 py-3 bg-sage-500 text-white rounded-2xl hover:bg-sage-600 disabled:opacity-40 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

/** Singolo messaggio della chat */
function ChatMessage({ message }: { message: AIMessage }) {
  const isUser = message.role === 'user'

  // Formatta markdown semplice (grassetto, liste)
  const formatContent = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        // Grassetto **...**
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        const formatted = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>
          }
          return <span key={j}>{part}</span>
        })
        return <span key={i} className="block">{formatted}</span>
      })
  }

  return (
    <div className={`flex items-start gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot size={14} className="text-sage-600" />
        </div>
      )}
      <div
        className={`max-w-[85%] px-4 py-3 rounded-3xl text-sm leading-relaxed
          ${isUser
            ? 'bg-sage-500 text-white rounded-tr-none'
            : message.isError
              ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-none shadow-soft'
              : 'bg-white text-gray-700 border border-cream-200 rounded-tl-none shadow-soft'
          }`}
      >
        <div className="space-y-0.5">
          {formatContent(message.content)}
        </div>
        {message.isOffline && (
          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <WifiOff size={9} /> Risposta offline
          </p>
        )}
      </div>
    </div>
  )
}
