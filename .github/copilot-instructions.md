# Word Saver — Copilot Instructions

## Visão Geral

**Word Saver** é uma Progressive Web App (PWA) para salvar e organizar vocabulário com revisões agendadas via notificações do navegador. Toda persistência é local (IndexedDB) — não há backend, autenticação ou chamadas HTTP de dados.

**Idioma do projeto:** Interface em português (pt-BR). Código em inglês.

---

## Stack & Versões

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | React | 18.3.1 |
| Linguagem | TypeScript | 5.9.3 |
| Build | Vite + SWC | 7.3.0 |
| Estado | Redux Toolkit | 2.11.2 |
| Roteamento | React Router DOM | 7.12.0 |
| Estilização | Tailwind CSS | 3.4.x |
| Banco local | IndexedDB (adapter próprio) | — |
| PWA | vite-plugin-pwa (Workbox) | 1.2.0 |
| Ícones | lucide-react | 0.562.0 |
| Utilitário CSS | clsx + tailwind-merge | — |
| Testes | Vitest + Testing Library | 4.x |
| Linting | ESLint 8 + Prettier 3 + Husky | — |

Path alias configurado: `@/` → `src/`

---

## Arquitetura: Mapa de Responsabilidades

```
src/
├── index.tsx              # Entry point — monta <App /> no DOM
├── app/                   # Bootstrap e configuração da aplicação
│   ├── App.tsx            # Raiz: Provider → ThemeProvider → AppInitializer → ModalProvider → Layout → Router
│   ├── AppInitializer.tsx # Inicializa DB + Redux slices + notificações antes de renderizar
│   └── router/            # Sistema de rotas
│       ├── routes.config.ts  # Array de RouteConfig com path, component, title
│       ├── Router.tsx        # Itera routesConfig e renderiza <Route>
│       └── types.ts          # AppRoutes enum + RouteConfig interface
│
├── shared/                # Tudo que é reutilizado entre features (sem lógica de negócio)
│   ├── ui/                # Componentes de UI puros: Button, Modal, Input, Card, Tab, Table, CountCard
│   ├── layout/            # Estrutura visual: Layout, Header, Navigation, Breadcrumb
│   ├── context/           # Contextos React globais
│   │   ├── ThemeContext    # dark/light mode — persiste no IndexedDB via settings store
│   │   └── ModalContext   # Gerenciador centralizado de modais (ver seção Modal System)
│   ├── hooks/             # useApp, useAppRouter, usePWA, useStorage
│   ├── utils/             # cn() para classes CSS, formatDate()
│   ├── types/             # globals.d.ts (declarações TypeScript globais)
│   └── global/global.css  # Tokens CSS semânticos + Tailwind base
│
├── core/                  # Infraestrutura técnica (sem React, sem negócio)
│   ├── database/          # Camada IndexedDB
│   │   ├── core/adapter.ts   # IndexedDBAdapter: add, get, getAll, update, delete, clear
│   │   ├── core/database.ts  # Singleton da conexão IDBDatabase
│   │   ├── core/schemas.ts   # Definição dos object stores e índices
│   │   └── config/database.ts # Nome do DB e versão
│   ├── notifications/     # Browser Notification API
│   │   └── notification/
│   │       ├── core-notification-service.ts # Solicitar permissão, exibir notificação, handle click
│   │       ├── alert-scheduler.ts           # Agenda timers baseados nos alertas do IndexedDB
│   │       └── types.ts                     # NotificationData, NotificationOptions, PermissionStatus
│   └── pwa/               # PWAInstallPrompt.tsx, PWAStatus.tsx
│
├── features/              # Lógica de negócio organizada por domínio
│   ├── vocabulary/
│   │   ├── words/         # CRUD de palavras
│   │   │   ├── components/    # AddWordModal, EditWordModal, ReviewWordModal
│   │   │   ├── stores/        # word-store.ts — Repository que estende IndexedDBAdapter
│   │   │   └── types/word.ts  # Word (input) + FullWord (completo com id, createdAt, etc.)
│   │   └── contexts/      # Categorias para organizar palavras
│   │       ├── components/    # AddContextModal, EditContextModal
│   │       ├── constants/     # DEFAULT_CONTEXT
│   │       ├── stores/        # context-store.ts — Repository
│   │       └── types/context.ts # Context (input) + FullContext (com id, wordCount)
│   ├── learning/
│   │   ├── flashcards/    # Flashcards.tsx — Revisão por cartões com filtro de contexto
│   │   └── quiz/          # Quiz.tsx — (stub, em desenvolvimento)
│   ├── analytics/
│   │   └── statistics/    # Statistics.tsx + stats-store.ts + Stats type
│   ├── alerts/            # Alertas de revisão agendados
│   │   ├── components/    # AddAlertModal, EditAlertModal
│   │   ├── stores/        # alert-store.ts — Repository
│   │   └── types/alert.ts # Alert (input) + FullAlert (com id, isActive, lastTriggered)
│   ├── data-management/
│   │   ├── export/        # ExportDataModal + export-service.ts + helpers (count, download, filename)
│   │   └── import/        # ImportDataModal + import-service.ts + validate-import-data.ts
│   └── settings/          # SettingsModal + setting-store.ts
│
├── store/                 # Redux global
│   ├── index.ts           # configureStore com todos os reducers
│   ├── hooks.ts           # useAppDispatch, useAppSelector (tipados)
│   └── slices/
│       ├── appSlice.ts    # loading, error, initialized, selectedContextId, isNotificationEnabled
│       ├── wordsSlice.ts  # words[], loading, error + thunks: fetchWords, addWord, updateWord, deleteWord, reviewWord
│       ├── contextsSlice.ts # contexts[], + thunks: fetchContexts, addContext, updateContext, deleteContext
│       ├── alertsSlice.ts # alerts[], + thunks: fetchAlerts, addAlert, updateAlert, deleteAlert
│       └── statsSlice.ts  # stats + thunk: fetchStats
│
└── pages/
    ├── dashboard/Dashboard.tsx # Compõe stats, ações rápidas, tabelas de words/contexts/alerts
    ├── ErrorPage.tsx
    └── NotFoundPage.tsx
```

---

## Fluxo de Dados

```
Componente
    │
    ▼
dispatch(thunk)           ← useAppDispatch()
    │
    ▼
Redux Thunk (slice)
    │
    ▼
Feature Repository        ← word-store.ts / context-store.ts / etc.
(estende IndexedDBAdapter)│
    │                     ← operações CRUD diretas no IndexedDB
    ▼
IndexedDBAdapter          ← core/database/core/adapter.ts
    │
    ▼
IndexedDB (browser)
```

**Regra:** Componentes NUNCA acessam o IndexedDB diretamente. Sempre via Redux thunk → Repository.

---

## Sistema de Modais (ModalContext)

Todos os modais são gerenciados centralmente em `shared/context/ModalContext.tsx`.

### Modais disponíveis

| Chave | Props | Descrição |
|---|---|---|
| `ADD_WORD` | — | Adicionar nova palavra |
| `EDIT_WORD` | `{ wordId: string }` | Editar palavra existente |
| `ADD_CONTEXT` | — | Criar novo contexto |
| `EDIT_CONTEXT` | `{ contextId: string }` | Editar contexto existente |
| `ADD_ALERT` | — | Criar alerta de revisão |
| `EDIT_ALERT` | `{ alertId: string }` | Editar alerta |
| `SETTINGS` | — | Configurações da aplicação |
| `EXPORT_DATA` | — | Modal de exportação JSON |
| `IMPORT_DATA` | — | Modal de importação JSON |
| `REVIEW_WORD` | `{ contextIds: string[], alertId?: string }` | Sessão de revisão de palavras |

### Como usar

```typescript
import { useModal } from '@/shared/context/ModalContext'

const { openModal, closeModal, isOpen, getProps } = useModal()

openModal('ADD_WORD')
openModal('EDIT_WORD', { wordId: 'abc-123' })
openModal('REVIEW_WORD', { contextIds: ['ctx-1', 'ctx-2'] })
closeModal('ADD_WORD')
```

**Para adicionar novo modal:** registrar em `ModalPropsMap`, adicionar o `isOpen()` condicional no provider, e criar o componente.

---

## Modelos de Dados

### FullWord
```typescript
interface FullWord {
  id: string              // crypto.randomUUID()
  word: string
  definition: string
  contextId: string       // FK para FullContext.id
  tags?: string[]
  exampleSentence?: string
  createdAt: string       // ISO 8601
  reviewCount: number
  lastReviewed: string | null  // ISO 8601
  difficulty: 'easy' | 'medium' | 'hard'
}
```

### FullContext
```typescript
interface FullContext {
  id: string
  name: string            // único (IndexedDB unique index)
  color: string           // hex ou CSS color
  icon: string
  createdAt: string
  wordCount: number       // denormalizado, atualizado no Repository
}
```

### FullAlert
```typescript
interface FullAlert {
  id: string
  name: string
  frequency: 'daily' | 'weekly'
  time: string            // "HH:MM"
  contextIds: string[]    // quais contextos revisar
  days: number[]          // 0=Dom, 1=Seg, ..., 6=Sáb
  createdAt: string
  lastTriggered: string | null
  isActive: boolean
}
```

### Stats
```typescript
interface Stats {
  totalWords: number
  totalContexts: number
  activeAlerts: number
  reviewedWords: number
  totalReviews: number
  difficultyStats: Record<string, number>
  recentWords: number
  recentReviews: number
  averageReviewsPerWord: number | string
}
```

### IndexedDB Object Stores
| Store | keyPath | Índices notáveis |
|---|---|---|
| `words` | `id` | `contextId`, `word`, `createdAt` |
| `contexts` | `id` | `name` (unique) |
| `alerts` | `id` | `isActive` |
| `settings` | `key` | — |
| `flashcards` | `id` | `category`, `difficulty` |
| `quiz` | `id` | `category`, `difficulty` |
| `stats` | `id` | `date` |

---

## Design System

### Tokens CSS Semânticos (global.css)

Sempre usar tokens semânticos, nunca cores hardcoded do Tailwind.

```
Fundos:      bg-background, bg-surface, bg-surface-muted, bg-surface-hover
Texto:       text-foreground, text-muted-foreground
Primário:    bg-primary, text-primary, bg-primary-hover, text-primary-foreground, bg-primary-soft
Secundário:  bg-secondary, text-secondary-foreground
Status:      text-success, text-destructive, text-warning, text-accent
Borda:       border-border, border-focus, border-error
Hover:       bg-ghost-hover, bg-outline-hover
```

### Componentes de UI (`shared/ui/`)

**Button** — variants: `primary` | `secondary` | `outline` | `ghost` | `danger`; sizes: `sm` | `md` | `lg` | `xl`

**Card** — suporta `Card.Header`, `Card.Title`, `Card.Content`; props: `clickable`, `className`

**Modal** — genérico com overlay e portal

**Input** — input controlado com label, erro e variantes

**Tab** — variantes: `underlined`; prop `defaultTab`

**Table** — colunas configuráveis; campo especial `'actions'` renderiza edit/delete

**CountCard** — card de métricas com ícone, número, cor de fundo

### Utilitário `cn()`
```typescript
import { cn } from '@/shared/utils/cn'
// merge condicional de classes Tailwind (clsx + tailwind-merge)
cn('base-class', condition && 'conditional-class', className)
```

---

## Rotas

```typescript
enum AppRoutes {
  DASHBOARD   = '/',
  FLASHCARDS  = '/flashcards',
  QUIZ        = '/quiz',
  STATISTICS  = '/statistics'
}
```

Adicionar rota: incluir entrada em `routesConfig` em `app/router/routes.config.ts`. O campo `protected` existe mas **não há autenticação** — é reservado para uso futuro.

---

## Padrões Obrigatórios

### Nomenclatura de arquivos
| Tipo | Convenção | Exemplo |
|---|---|---|
| Componentes React | PascalCase | `AddWordModal.tsx` |
| Hooks | camelCase, prefixo `use` | `useAppRouter.ts` |
| Slices Redux | camelCase + sufixo `Slice` | `wordsSlice.ts` |
| Repositories (stores de feature) | kebab-case + sufixo `-store` | `word-store.ts` |
| Types | camelCase | `word.ts`, `context.ts` |
| Utils | kebab-case | `format-date.ts`, `cn.ts` |
| Barrel exports | `index.ts` em cada módulo | — |

### Ordem de imports
```typescript
// 1. React e bibliotecas externas
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Store / Redux
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addWord } from '@/store/slices/wordsSlice'

// 3. Features
import { WordsList } from '@/features/vocabulary'

// 4. Shared (UI, layout, context, hooks, utils)
import { Button, Modal } from '@/shared/ui'
import { useModal } from '@/shared/context/ModalContext'

// 5. Types (sempre com `import type`)
import type { FullWord } from '@/features/vocabulary/words/types/word'
```

### Estrutura de nova feature
```
features/minha-feature/
├── components/        # Componentes React
├── hooks/             # Hooks customizados (se houver lógica local)
├── stores/            # Repository estendendo IndexedDBAdapter
├── types/             # Interfaces TypeScript do domínio
└── index.ts           # Barrel export público
```

Se a feature precisar de estado global, criar slice em `store/slices/` e registrar no `store/index.ts`.

### Criando um Redux Slice
Seguir o padrão de `wordsSlice.ts`:
1. Definir interface `XxxState` com `loading`, `error`, e dados
2. `createAsyncThunk` para cada operação async (chamam o repository)
3. `createSlice` com `extraReducers` para pending/fulfilled/rejected
4. Exportar actions e reducer

---

## Inicialização da Aplicação

Sequência em `AppInitializer` via `initializeApp` thunk:
1. `database.init()` — abre/cria o IndexedDB
2. `Promise.all([fetchWords, fetchContexts, fetchAlerts, fetchStats])` — carrega estado inicial
3. `notificationService.init()` — solicita permissão de notificação

O app **não renderiza** enquanto `initialized === false` ou `loading === true`.

---

## Notificações

- `CoreNotificationService` encapsula a Browser Notification API
- `alert-scheduler.ts` usa `setInterval`/`setTimeout` para disparar notificações baseadas nos alertas cadastrados
- Click na notificação navega para `/?review=contextId1,contextId2&alert=alertId`
- O `Dashboard.tsx` captura esses query params no `useEffect` e abre `openModal('REVIEW_WORD', { contextIds })`

---

## PWA

- Service Worker gerado pelo Workbox via `vite-plugin-pwa`
- `registerType: 'autoUpdate'` — atualiza automaticamente
- `globPatterns` cacheia todos os assets estáticos para offline
- `PWAInstallPrompt.tsx` — exibe banner de instalação
- `PWAStatus.tsx` — indica status de atualização do SW

---

## Problemas Conhecidos e Anti-patterns

1. **`stores/` nas features são repositories** — os arquivos em `features/*/repositories/` são camadas de acesso a dados que estendem `IndexedDBAdapter`. O nome `stores/` era enganoso; a pasta correta agora é `repositories/`.

2. **`helpers/` em data-management** — foi padronizado para `utils/`. Ao criar novos utilitários em features, sempre use `utils/`.

3. **`protected: true` nas rotas** — não há sistema de autenticação. Ignorar o campo ao adicionar rotas.

4. **`Settings` type genérico** — `{ [key: string]: string }` sem keys definidas. Preferir type específico ao adicionar novas settings.

5. **Sem testes** — a infraestrutura Vitest está configurada (`.vitest/setup`, `happy-dom`). Novos features devem incluir `test.tsx` ao lado dos componentes.

6. **`features/learning/quiz/`** — stub em desenvolvimento. O componente `Quiz.tsx` existe mas sem lógica completa.

7. **Código comentado no Dashboard** — remover ou implementar, não deixar comentado.

---

## Scripts Disponíveis

```bash
npm run dev          # Dev server (Vite)
npm run build        # tsc && vite build
npm run test         # Vitest (watch)
npm run test:ui      # Vitest com UI
npm run lint         # ESLint (zero warnings)
npm run lint:fix     # ESLint com auto-fix
npm run prettier     # Formatar com Prettier
npm run typecheck    # tsc --noEmit
```

Husky executa `eslint --fix` + `prettier --write` em todo commit via lint-staged.

---

## Exemplos de Uso Frequente

### Ler estado Redux num componente
```typescript
const { words, loading } = useAppSelector((state) => state.words)
const { contexts } = useAppSelector((state) => state.contexts)
```

### Dispatch de ação
```typescript
const dispatch = useAppDispatch()
await dispatch(addWord({ word: 'ephemeral', definition: '...', contextId: 'ctx-1' })).unwrap()
```

### Abrir modal
```typescript
const { openModal } = useModal()
openModal('ADD_WORD')
openModal('EDIT_WORD', { wordId: word.id })
```

### Navegar programaticamente
```typescript
import { useAppRouter } from '@/shared/hooks'
const { navigate } = useAppRouter()
navigate('/flashcards')
```

### Criar Repository para nova feature
```typescript
import { STORES, IndexedDBAdapter } from '@/core/database'

class MyFeatureStore extends IndexedDBAdapter {
  constructor() {
    super(STORES.MY_STORE)  // adicionar constante em STORES
  }

  async addItem(data: MyType): Promise<IDBValidKey> {
    return this.add({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...data })
  }
}

export default new MyFeatureStore()
```
