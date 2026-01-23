# Migração de useReducer para Redux Toolkit

## Resumo das Mudanças

Este documento descreve a migração completa do gerenciamento de estado da aplicação de `useReducer` para **Redux Toolkit**.

## Estrutura Criada

### 1. Store Redux (`/src/store/`)

```
src/store/
├── index.ts          # Configuração da store principal
├── hooks.ts          # Hooks customizados (useAppDispatch, useAppSelector)
└── slices/
    ├── appSlice.ts       # Estado da aplicação (inicialização, UI, view preferences)
    ├── wordsSlice.ts     # Gerenciamento de palavras
    ├── alertsSlice.ts    # Gerenciamento de alertas
    ├── contextsSlice.ts  # Gerenciamento de contextos
    └── statsSlice.ts     # Gerenciamento de estatísticas
```

### 2. Slices Criados

Cada slice utiliza as funcionalidades do Redux Toolkit:

- **createSlice**: Para definir reducers e actions de forma simplificada
- **createAsyncThunk**: Para operações assíncronas (fetch, add, update, delete)
- **TypeScript**: Tipagem completa para state e actions

#### appSlice

- Estado de inicialização da aplicação
- Preferências de visualização (grid/list)
- Query de busca
- Contexto selecionado
- Status de notificações

#### wordsSlice

- CRUD de palavras (Create, Read, Update, Delete)
- Review de palavras
- Loading e error states

#### alertsSlice

- CRUD de alertas
- Agendamento de notificações
- Loading e error states

#### contextsSlice

- CRUD de contextos
- Gerenciamento de palavras relacionadas
- Loading e error states

#### statsSlice

- Fetch de estatísticas
- Loading e error states

## Hooks Atualizados

### 1. Hooks Redux (`/src/store/hooks.ts`)

```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

### 2. Hook useApp (`/src/shared/hooks/useApp.ts`)

Substitui o antigo `AppContext`, fornecendo:

- Estado da aplicação
- Actions para modificar o estado
- Completamente tipado com TypeScript

### 3. Hooks de Features Atualizados

Todos os hooks foram refatorados para usar Redux:

- `/src/features/vocabulary/words/hooks/useWords.ts`
- `/src/features/alerts/hooks/useAlerts.ts`
- `/src/features/vocabulary/contexts/hooks/useContexts.ts`
- `/src/features/analytics/statistics/hooks/useStats.ts`

**Antes (useReducer):**

```typescript
const [state, dispatch] = useReducer(reducer, initialState)
dispatch({ type: 'ACTION', payload: data })
```

**Depois (Redux Toolkit):**

```typescript
const dispatch = useAppDispatch()
const { data, loading, error } = useAppSelector((state) => state.feature)
dispatch(asyncAction(data))
```

## Provider e Inicialização

### 1. Redux Provider (`/src/app/App.tsx`)

```typescript
import { Provider } from 'react-redux'
import { store } from '../store'

<Provider store={store}>
  <App />
</Provider>
```

### 2. AppInitializer (`/src/shared/components/AppInitializer.tsx`)

Componente responsável por:

- Inicializar a aplicação (database, notificações)
- Mostrar loading state durante inicialização
- Exibir erros se houver falha

## Benefícios da Migração

### 1. DevTools

- Redux DevTools para debug
- Time-travel debugging
- Visualização de actions e state changes

### 2. Código Mais Limpo

- Menos boilerplate code
- Actions creators automáticos
- Reducers imutáveis por padrão

### 3. TypeScript

- Tipagem automática do state
- Autocomplete para actions
- Detecção de erros em tempo de desenvolvimento

### 4. Performance

- Memoização automática com selectors
- Re-renders otimizados
- Middleware configurável

### 5. Manutenibilidade

- Estado centralizado
- Lógica de negócio separada dos componentes
- Testabilidade melhorada

## Comparação: Antes vs Depois

### Antes (useReducer)

```typescript
// Definir types
type Action = { type: 'SET_DATA'; payload: Data }

// Definir reducer
function reducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, data: action.payload }
    default:
      return state
  }
}

// Usar no componente
const [state, dispatch] = useReducer(reducer, initialState)
dispatch({ type: 'SET_DATA', payload: newData })
```

### Depois (Redux Toolkit)

```typescript
// Slice com reducer e actions automáticos
const slice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    setData: (state, action) => {
      state.data = action.payload // Imutável com Immer
    }
  }
})

// Usar no componente
const dispatch = useAppDispatch()
const data = useAppSelector((state) => state.feature.data)
dispatch(setData(newData))
```

## Como Usar

### 1. Acessar Estado

```typescript
import { useAppSelector } from '@/store/hooks'

const MyComponent = () => {
  const { words, loading, error } = useAppSelector((state) => state.words)
  // ...
}
```

### 2. Dispatch Actions

```typescript
import { useAppDispatch } from '@/store/hooks'
import { addWord, fetchWords } from '@/store/slices/wordsSlice'

const MyComponent = () => {
  const dispatch = useAppDispatch()

  // Async action
  const handleAdd = async () => {
    await dispatch(addWord(wordData)).unwrap()
  }

  // Sync action
  useEffect(() => {
    dispatch(fetchWords())
  }, [dispatch])
}
```

### 3. Usar Hooks Customizados

```typescript
import { useWords } from '@/features/vocabulary/words/hooks/useWords'

const MyComponent = () => {
  const { words, loading, addWord, deleteWord } = useWords()
  // API mantida igual, mas agora usa Redux por baixo
}
```

## Próximos Passos

- [ ] Implementar Redux Persist para persistência do estado
- [ ] Adicionar middleware customizado se necessário
- [ ] Otimizar selectors com reselect/createSelector
- [ ] Adicionar testes para os slices
- [ ] Considerar RTK Query para gerenciamento de cache

## Recursos

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [TypeScript with Redux](https://redux.js.org/usage/usage-with-typescript)
