# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server (Vite)
npm run build        # tsc + vite build
npm run test         # Vitest in watch mode
npm run lint         # ESLint — zero warnings enforced
npm run lint:fix     # ESLint with auto-fix
npm run typecheck    # tsc --noEmit
npm run prettier     # Prettier format
```

Test files are named `test.tsx` (not `*.test.tsx`) and sit next to the component they test. Vitest only picks up files matching `**/test.{ts,tsx}`.

Pre-commit hook runs `lint-staged` (eslint --fix + prettier) automatically on staged files.

## Architecture

Word Saver is a **PWA with no backend** — all persistence is local via IndexedDB. No HTTP data calls.

Path alias: `@/` → `src/`

### Layer responsibilities

| Layer | Rule |
|---|---|
| `pages/` | Orchestrates features, no business logic |
| `features/` | Business logic by domain; never imports other features |
| `shared/` | Generic UI/hooks/utils; no business logic |
| `core/` | Technical infrastructure (IndexedDB, PWA, notifications) |
| `store/` | Redux global state, one slice per domain |

Features communicate with each other only through the Redux store, never by direct import.

Routes point to `pages/`, never directly to features.

### Data flow

```
Component → dispatch(thunk) → Redux Slice → Repository (extends IndexedDBAdapter) → IndexedDB
```

Components never access IndexedDB or repositories directly.

### App initialization sequence (`AppInitializer.tsx`)

1. `database.init()` — opens/creates IndexedDB
2. `Promise.all([fetchWords, fetchContexts, fetchAlerts, fetchStats])` — loads initial state
3. `notificationService.init()` — requests notification permission

The app does not render until `initialized === true`.

## Key patterns

### Modal system

All modals are managed centrally via `ModalContext`. Available modal keys: `ADD_ALERT`, `EDIT_ALERT`, `SETTINGS`, `EXPORT_DATA`, `IMPORT_DATA`, `REVIEW_WORD`.

Words and contexts are no longer created/edited via modal — `WordsTable` handles words with inline cell editing, and `WordsTableToolbar` handles contexts with an inline add/edit form.

```typescript
const { openModal, closeModal } = useModal()
openModal('EDIT_ALERT', { alertId: 'abc-123' })
openModal('REVIEW_WORD', { contextIds: ['ctx-1'], alertId: 'alert-1' })
```

To add a new modal: register in `ModalPropsMap` in `ModalContext.tsx`, add conditional render in the provider, create the component.

### Creating a repository for a new feature

```typescript
import { STORES, IndexedDBAdapter } from '@/core/database'

class MyFeatureStore extends IndexedDBAdapter {
  constructor() { super(STORES.MY_STORE) }
  async addItem(data: MyType) {
    return this.add({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...data })
  }
}
export default new MyFeatureStore()
```

Add the store constant to `STORES` in `core/database/core/schemas.ts`.

### Redux slice pattern

Follow `wordsSlice.ts`: define `XxxState` with `loading`/`error`/data, use `createAsyncThunk` for each async op (calling the repository), use `extraReducers` for pending/fulfilled/rejected.

### CSS — always use semantic tokens, never raw Tailwind colors

```
bg-background, bg-surface, bg-surface-muted, bg-surface-hover
text-foreground, text-muted-foreground
bg-primary, text-primary, bg-primary-hover, bg-primary-soft
text-success, text-destructive, text-warning, text-accent
border-border, border-focus, border-error
bg-ghost-hover, bg-outline-hover
```

Use `cn()` from `@/shared/utils/cn` for conditional class merging (clsx + tailwind-merge).

## Naming conventions

| Type | Convention |
|---|---|
| React components | `PascalCase.tsx` |
| Hooks | `camelCase` with `use` prefix |
| Redux slices | `camelCase` + `Slice` suffix |
| Feature repositories | `kebab-case` + `-store.ts` suffix |
| Utils / services | `kebab-case` |
| Barrel exports | `index.ts` in each module |

## Import order

```typescript
// 1. React and external libraries
// 2. Store / Redux
// 3. Features
// 4. Shared (UI, layout, context, hooks, utils)
// 5. Types (always `import type`)
```

## Known issues

- `features/learning/quiz/` is a stub — `Quiz.tsx` exists but has no complete logic.
- `protected: true` on routes has no effect — there is no auth system.
- `Settings` type is `{ [key: string]: string }` — prefer specific types for new settings.
- Alert notifications (`AlertScheduler`) are scheduled with `setTimeout` in memory — they only fire while the app is open in a browser tab. There is no Service Worker push/periodic sync, since this is a backend-less PWA. The add/edit alert modals show a warning about this to the user.
