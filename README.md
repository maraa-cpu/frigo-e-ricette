# 🍃 Frigo & Ricette — PWA

Una Progressive Web App moderna per cucinare con quello che hai in casa.
Riduci gli sprechi, scopri ricette, organizza la spesa e chatta con **ChefBot**.

---

## 🚀 Avvio rapido

```bash
# 1. Installa le dipendenze
npm install

# 2. Avvia in sviluppo
npm run dev

# 3. Apri nel browser
# http://localhost:5173
```

---

## 📱 Funzionalità

| Sezione | Descrizione |
|---------|-------------|
| 🏠 **Home** | Dashboard con stats, scadenze e ricette consigliate |
| ❄️ **Frigo** | Gestisci ingredienti con categorie e scadenze |
| 🍽️ **Ricette** | Suggerimenti con score anti-spreco, filtri avanzati |
| 🛒 **Spesa** | Lista intelligente generata dalle ricette |
| 🤖 **ChefBot** | Assistente AI per suggerimenti e consigli |
| ❤️ **Preferiti** | Ricette salvate |

---

## 🤖 Configurare ChefBot (AI reale)

Per default, ChefBot usa risposte simulate. Per attivare un'AI reale:

1. **Crea una serverless function** (Vercel/Netlify/Supabase)
2. **Copia** `.env.local.example` in `.env.local`
3. **Imposta** `VITE_AI_BACKEND_URL` con l'URL del tuo backend

### Esempio backend (Node.js + OpenAI)

```javascript
// api/chefbot.js (Vercel Serverless Function)
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  const { messages, context } = req.body
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 500,
  })
  
  res.json({ reply: completion.choices[0].message.content })
}
```

> ⚠️ **Mai mettere la API key nel frontend!** Solo nel backend server.

---

## 🌱 Score Anti-Spreco

Ogni ricetta ha uno score da **0 a 100** calcolato in base a:

- 🟢 **+50 pt** — ingredienti già disponibili
- 🟡 **+30 pt** — ingredienti in scadenza consumati
- 🔴 **-20 pt** — ingredienti mancanti
- ⚡ **+5 pt** — bonus per ricette veloci (< 15 min)

---

## 🏗️ Struttura progetto

```
src/
├── components/       # Componenti riutilizzabili
│   ├── BottomNav.tsx
│   ├── RecipeCard.tsx
│   ├── IngredientModal.tsx
│   ├── ExpirationBadge.tsx
│   └── AntiWasteScoreBadge.tsx
├── pages/            # Schermate principali
│   ├── HomePage.tsx
│   ├── FrigoPage.tsx
│   ├── RicettePage.tsx
│   ├── SpesaPage.tsx
│   ├── ChefBotPage.tsx
│   └── PreferitiPage.tsx
├── hooks/            # Custom hooks
│   ├── useAppContext.tsx  # Stato globale
│   └── useOnlineStatus.ts
├── services/         # Servizi
│   ├── storage.ts    # LocalStorage
│   └── aiService.ts  # ChefBot AI
├── types/            # TypeScript types
│   └── index.ts
├── data/             # Dati e costanti
│   ├── demoIngredients.ts
│   ├── demoRecipes.ts
│   └── constants.ts
└── utils/            # Helper functions
    └── index.ts
```

---

## 📦 Build produzione

```bash
npm run build
npm run preview
```

---

## 🔧 Tech Stack

- **React 18** + **Vite 5**
- **TypeScript** — tipizzazione completa
- **Tailwind CSS** — design system calido
- **vite-plugin-pwa** — service worker + manifest
- **LocalStorage** — dati offline
- **lucide-react** — icone
