/**
 * AI Service - ChefBot
 *
 * Questo servizio gestisce le comunicazioni con l'assistente AI.
 * 
 * ARCHITETTURA:
 * - In produzione: chiama un backend/serverless function che gestisce la chiave API.
 * - In modalità demo (default): usa risposte simulate offline.
 * 
 * PER COLLEGARE UN BACKEND:
 * 1. Crea una serverless function (es. Vercel, Netlify, Supabase Edge Functions)
 * 2. Imposta AI_BACKEND_URL nel file .env.local
 * 3. Il backend riceverà: { messages, context } e ritornerà { reply: string }
 */

import type { AIMessage, Ingredient, Recipe } from '../types'
import { isExpiringSoon, normalize } from '../utils'
import { EXPIRATION_THRESHOLDS } from '../data/constants'

// URL del backend AI (da configurare nel .env.local)
const AI_BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL as string | undefined

/** Contesto passato all'AI */
export interface AIContext {
  ingredients: Ingredient[]
  favorites: Recipe[]
  isOnline: boolean
}

/** Richiesta al backend AI */
interface AIRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  context: {
    ingredientsList: string
    expiringList: string
    favoritesCount: number
  }
}

/** Invia un messaggio al backend AI */
async function callAIBackend(request: AIRequest): Promise<string> {
  if (!AI_BACKEND_URL) {
    throw new Error('Backend AI non configurato. Usando modalità demo.')
  }
  const response = await fetch(AI_BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(15000), // 15 secondi timeout
  })
  if (!response.ok) {
    throw new Error(`Errore backend: ${response.status}`)
  }
  const data = await response.json() as { reply: string }
  return data.reply
}

// ============================================================
// RISPOSTE DEMO / FALLBACK
// ============================================================

/** Genera una risposta demo intelligente basata sul contesto */
function generateDemoResponse(userMessage: string, context: AIContext): string {
  const msg = normalize(userMessage)
  const { ingredients, isOnline } = context

  const ingredientNames = ingredients.map(i => i.name.toLowerCase())
  const expiring = ingredients.filter(
    i => i.expirationDate && isExpiringSoon(i, EXPIRATION_THRESHOLDS.WARNING)
  )
  const expiringNames = expiring.map(i => i.name.toLowerCase())

  // Risposta offline
  if (!isOnline) {
    return `📵 **Sei offline!** Posso usare solo ingredienti e ricette già salvate.

Nel tuo frigo ho trovato: ${ingredientNames.slice(0, 5).join(', ')}${ingredientNames.length > 5 ? '...' : ''}.

${expiring.length > 0 ? `⚠️ Attenzione: **${expiringNames.join(', ')}** sta${expiring.length > 1 ? 'nno' : ''} per scadere!` : ''}

Vai nella sezione **Ricette** per vedere le proposte basate su quello che hai. 🍽️`
  }

  // Cosa cucino oggi / suggerisci ricetta
  if (msg.includes('cosa cucino') || msg.includes('suggerisci') || msg.includes('cosa posso fare')) {
    const hasZucchine = ingredientNames.some(n => n.includes('zucchine'))
    const hasPasta = ingredientNames.some(n => n.includes('pasta'))
    const hasUova = ingredientNames.some(n => n.includes('uova') || n.includes('uovo'))
    const hasCeci = ingredientNames.some(n => n.includes('ceci'))

    const suggestions: string[] = []
    if (hasPasta && hasZucchine && hasUova) suggestions.push('🍝 **Pasta Zucchine e Uova** — la mia prima scelta!')
    if (hasCeci) suggestions.push('🥗 **Insalata di Ceci** — pronta in 10 minuti')
    if (hasZucchine && hasUova) suggestions.push('🍳 **Frittata Svuota Frigo** — velocissima!')

    if (suggestions.length === 0) {
      suggestions.push('🥘 **Risotto con verdure** — usando ' + ingredientNames.slice(0, 3).join(', '))
    }

    return `Ciao! 👨‍🍳 Ecco cosa ti consiglio con quello che hai in frigo:

${suggestions.join('\n')}

${expiring.length > 0 ? `\n💡 Ti suggerisco di usare prima **${expiringNames.join(' e ')}** perché sta${expiring.length > 1 ? 'nno' : ''} per scadere!` : ''}

Vuoi il procedimento completo di una di queste ricette?`
  }

  // Scadenze
  if (msg.includes('scadenza') || msg.includes('scade') || msg.includes('consumare') || msg.includes('prima')) {
    if (expiring.length === 0) {
      return '✅ Ottima notizia! Nessun ingrediente è in scadenza imminente. Hai tutto sotto controllo!'
    }
    const list = expiring.map(i => {
      const days = Math.ceil(
        (new Date(i.expirationDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      return `- **${i.name}**: ${days <= 0 ? 'scaduto!' : days === 1 ? 'scade domani' : `scade in ${days} giorni`}`
    }).join('\n')

    return `⚠️ **Ingredienti da consumare presto:**

${list}

💡 **La mia proposta anti-spreco:**
Con ${expiring[0].name} potresti fare ${expiring[0].name.toLowerCase().includes('zucchine') ? 'una frittata o pasta' : expiring[0].name.toLowerCase().includes('pomodori') ? 'un sugo fresco o insalata caprese' : 'qualcosa di buono'}! Vai alla sezione **Ricette** per vedere le proposte ordinate per score anti-spreco. 🌱`
  }

  // Sostituzione ingredienti
  if (msg.includes('sostituire') || msg.includes('alternativa') || msg.includes('senza') || msg.includes('ho finito')) {
    if (msg.includes('latte')) {
      return `🥛 **Sostituzioni del latte:**

• **Bevanda di soia** — sostituisce 1:1 in quasi tutte le ricette
• **Bevanda di avena** — più dolce, ottima per dolci e besciamella
• **Bevanda di riso** — più liquida, da ridurre un po'
• **Acqua + burro** (70ml acqua + 30g burro per 100ml latte) — per ricette salate
• **Yogurt diluito** — per frittate e impasti

Quale ricetta stai preparando? Posso darti il consiglio più preciso! 😊`
    }
    if (msg.includes('uova') || msg.includes('uovo')) {
      return `🥚 **Sostituzioni delle uova:**

• **Aquafaba** (liquido ceci) — 3 cucchiai = 1 uovo, perfetto per fritture e impasti
• **Semi di lino macinati** — 1 cucchiaio + 3 acqua = 1 uovo (per dolci)
• **Banana schiacciata** — ½ banana = 1 uovo (per dolci)
• **Yogurt** — 60g = 1 uovo (per torte)

Sai che hai i **ceci in frigo**? Il loro liquido è perfetto come sostituto! 💡`
    }
    return `🔄 **Sostituzioni in cucina:**

Di cosa hai bisogno di sostituire? Dimmi l'ingrediente e la ricetta e ti do il consiglio migliore!

Esempi comuni:
- Burro → olio d'oliva (¾ della quantità)
- Panna → yogurt greco o ricotta
- Vino → brodo + succo di limone
- Aglio fresco → aglio in polvere (¼ di cucchiaino = 1 spicchio)`
  }

  // Menù multi-giorno
  if (msg.includes('menù') || msg.includes('menu') || msg.includes('settimana') || msg.includes('giorni')) {
    const hasIngredients = ingredientNames.slice(0, 5)
    return `📅 **Proposta Menù 2 Giorni** basata sul tuo frigo:

**Giorno 1**
🌅 Pranzo: Pasta Zucchine e Uova (veloce, usa zucchine in scadenza)
🌙 Cena: Insalata di Ceci con pomodori freschi

**Giorno 2**
🌅 Pranzo: Frittata Svuota Frigo con ${hasIngredients.slice(0, 2).join(' e ')}
🌙 Cena: Pasta al Pomodoro e Mozzarella

💡 Questo menù consuma: ${ingredientNames.slice(0, 4).join(', ')} — ottimo per ridurre gli sprechi!

Vuoi che aggiunga i mancanti alla lista della spesa? 🛒`
  }

  // Cena veloce / economica
  if (msg.includes('veloce') || msg.includes('economica') || msg.includes('rapida') || msg.includes('velocissima')) {
    return `⚡ **Idee per una cena veloce ed economica:**

1. 🥗 **Insalata di Ceci** (10 min) — ceci + pomodori + mozzarella
2. 🍳 **Frittata** (15 min) — uova + quello che hai
3. 🍝 **Pasta all'olio** (15 min) — pasta + aglio + olio

Il mio consiglio: punta sui **ceci**! Pronti in pochi minuti e molto nutrienti. 

Con **${ingredientNames.slice(0, 3).join(', ')}** hai tutto il necessario per una cena perfetta! 🌟`
  }

  // Risposta generica
  return `👨‍🍳 Ciao! Sono **ChefBot**, il tuo assistente di cucina!

Nel tuo frigo ho trovato **${ingredientNames.length} ingredienti**:
${ingredientNames.slice(0, 6).map(n => `• ${n}`).join('\n')}${ingredientNames.length > 6 ? `\n• ...e altri ${ingredientNames.length - 6}` : ''}

${expiring.length > 0 ? `\n⚠️ **Da consumare presto:** ${expiringNames.join(', ')}` : ''}

Cosa posso fare per te? Ecco alcune idee:
• "Cosa cucino stasera?"
• "Cosa devo consumare prima?"
• "Fammi un menù per 2 giorni"
• "Come sostituisco il latte?"
• "Idee per una cena veloce"

${AI_BACKEND_URL ? '' : '\n💡 *Modalità demo attiva — connetti il backend AI per risposte personalizzate!*'}`
}

// ============================================================
// FUNZIONE PRINCIPALE
// ============================================================

/** Invia un messaggio a ChefBot e ottiene una risposta */
export async function sendMessageToChefBot(
  userMessage: string,
  history: AIMessage[],
  context: AIContext
): Promise<string> {
  // Costruisce il sistema di contesto
  const ingredientsList = context.ingredients
    .map(i => `${i.name} (${i.quantity}${i.unit})`)
    .join(', ')

  const expiringIngredients = context.ingredients
    .filter(i => i.expirationDate && isExpiringSoon(i, EXPIRATION_THRESHOLDS.WARNING))

  const expiringList = expiringIngredients
    .map(i => `${i.name} (scade: ${i.expirationDate})`)
    .join(', ')

  // Se non siamo online, usa sempre il fallback
  if (!context.isOnline) {
    return generateDemoResponse(userMessage, context)
  }

  // Prova a chiamare il backend AI
  if (AI_BACKEND_URL) {
    try {
      const systemPrompt = `Sei ChefBot, un assistente culinario amichevole e pratico. 
Parla in italiano. Sei allegro, conciso e dai consigli pratici.
Ingredienti disponibili: ${ingredientsList || 'Nessuno'}
Ingredienti in scadenza: ${expiringList || 'Nessuno'}
Ricette preferite: ${context.favorites.length} salvate`

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...history.slice(-6).map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: userMessage },
      ]

      return await callAIBackend({
        messages,
        context: {
          ingredientsList,
          expiringList,
          favoritesCount: context.favorites.length,
        },
      })
    } catch (error) {
      console.warn('[ChefBot] Backend non disponibile, uso fallback demo:', error)
      // Fallback alla risposta demo
    }
  }

  // Modalità demo
  return generateDemoResponse(userMessage, context)
}

/** Verifica se il backend AI è configurato */
export function isAIBackendConfigured(): boolean {
  return Boolean(AI_BACKEND_URL)
}
