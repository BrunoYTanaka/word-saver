# 🏗️ Arquitetura Modular do Word Saver

## 📁 Estrutura do Projeto

```
src/
├── index.tsx                     # Ponto de entrada da aplicação
│
├── app/                          # Configuração da aplicação
│   ├── App.tsx                   # Componente raiz da aplicação
│   ├── AppInitializer.tsx        # Inicialização e bootstrap
│   └── router/                   # Sistema de rotas
│       ├── index.ts
│       ├── Router.tsx            # Componente de roteamento
│       ├── routes.config.ts      # Configuração declarativa de rotas
│       └── types.ts              # Tipos e enum AppRoutes
│
├── shared/                       # Recursos compartilhados
│   ├── ui/                       # Componentes UI reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── CountCard.tsx
│   │   ├── Tab.tsx
│   │   ├── Table.tsx
│   │   └── index.ts
│   ├── layout/                   # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx        # Bottom nav mobile + sidebar desktop
│   │   ├── Breadcrumb.tsx
│   │   ├── Layout.tsx
│   │   └── index.ts
│   ├── context/                  # Contextos React globais
│   │   ├── ModalContext.tsx      # Gerenciamento centralizado de modais
│   │   ├── ThemeContext.tsx      # Gerenciamento de tema dark/light
│   │   └── index.ts
│   ├── hooks/                    # Hooks reutilizáveis
│   │   ├── useApp.ts             # Hook principal da aplicação
│   │   ├── useAppRouter.ts       # Hook de navegação programática
│   │   ├── usePWA.ts             # Hook para funcionalidades PWA
│   │   ├── useStorage.ts         # Hook para localStorage
│   │   └── index.ts
│   ├── utils/                    # Utilitários globais
│   │   ├── cn.ts                 # Utilitário de merge de classes CSS (clsx + tailwind-merge)
│   │   ├── format-date.ts        # Formatação de datas
│   │   └── index.ts
│   ├── types/                    # Tipos globais
│   │   ├── globals.d.ts          # Declarações TypeScript globais
│   │   └── index.ts
│   ├── global/                   # Estilos globais
│   │   └── global.css            # CSS global, tokens de design e variáveis de tema
│   └── index.ts
│
├── core/                         # Camada de infraestrutura técnica
│   ├── database/                 # Gerenciamento do IndexedDB
│   │   ├── config/
│   │   │   └── database.ts       # Configurações (nome, versão do banco)
│   │   ├── core/
│   │   │   ├── adapter.ts        # Adapter para operações IndexedDB
│   │   │   ├── database.ts       # Classe base do database
│   │   │   └── schemas.ts        # Schemas e object stores
│   │   └── index.ts
│   ├── notifications/            # Sistema de notificações
│   │   └── notification/
│   │       ├── alert-scheduler.ts           # Agendamento de alertas
│   │       ├── core-notification-service.ts # Serviço central de notificações
│   │       ├── types.ts                     # Tipos de notificações
│   │       └── index.ts
│   ├── pwa/                      # Funcionalidades PWA
│   │   ├── PWAInstallPrompt.tsx  # Prompt de instalação do app
│   │   ├── PWAStatus.tsx         # Indicador de status do PWA
│   │   └── index.ts
│   └── index.ts
│
├── features/                     # Módulos de funcionalidade (domínios de negócio)
│   ├── vocabulary/               # 📚 Vocabulário
│   │   ├── words/
│   │   │   ├── components/       # AddWordModal, EditWordModal, ReviewWordModal
│   │   │   ├── repositories/     # word-store.ts (acesso ao IndexedDB)
│   │   │   └── types/            # word.ts (Word, FullWord)
│   │   ├── contexts/
│   │   │   ├── components/       # AddContextModal, EditContextModal
│   │   │   ├── constants/        # context.ts (cores e ícones disponíveis)
│   │   │   ├── repositories/     # context-store.ts (acesso ao IndexedDB)
│   │   │   └── types/            # context.ts
│   │   └── index.ts
│   │
│   ├── learning/                 # 🎓 Aprendizado
│   │   ├── flashcards/
│   │   │   ├── components/       # Flashcards.tsx
│   │   │   └── index.ts
│   │   ├── quiz/
│   │   │   ├── components/       # Quiz.tsx
│   │   │   └── index.ts
│   │   ├── review/               # Sistema de revisão de palavras
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── analytics/                # 📊 Análises e Estatísticas
│   │   ├── statistics/
│   │   │   ├── components/       # Statistics.tsx
│   │   │   ├── repositories/     # stats-store.ts (acesso ao IndexedDB)
│   │   │   ├── types/            # stats.ts
│   │   │   └── index.ts
│   │   ├── progress/             # Progresso de aprendizado
│   │   │   ├── types/            # progress.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── alerts/                   # 🔔 Alertas e Notificações
│   │   ├── components/           # AddAlertModal.tsx, EditAlertModal.tsx
│   │   ├── repositories/         # alert-store.ts (acesso ao IndexedDB)
│   │   ├── types/                # alert.ts
│   │   └── index.ts
│   │
│   ├── data-management/          # 💾 Gestão de Dados
│   │   ├── export/
│   │   │   ├── components/       # ExportDataModal.tsx
│   │   │   ├── services/         # export-service.ts (orquestra exportação completa)
│   │   │   ├── utils/            # count-records.ts, download-json.ts, generate-filename.ts
│   │   │   └── index.ts
│   │   ├── import/
│   │   │   ├── components/       # ImportDataModal.tsx
│   │   │   ├── services/         # import-service.ts (orquestra importação completa)
│   │   │   ├── utils/            # validate-import-data.ts
│   │   │   └── index.ts
│   │   ├── backup/               # Backup de dados
│   │   │   ├── repositories/     # backup-store.ts (acesso ao IndexedDB)
│   │   │   ├── types/            # backup.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── settings/                 # ⚙️ Configurações
│   │   ├── components/           # SettingsModal.tsx
│   │   ├── repositories/         # setting-store.ts (acesso ao IndexedDB)
│   │   ├── types/                # settings.ts
│   │   └── index.ts
│   │
│   └── index.ts                  # Exports centrais de features
│
├── store/                        # State Management Global (Redux Toolkit)
│   ├── index.ts                  # Configuração da store
│   ├── hooks.ts                  # Hooks tipados (useAppDispatch, useAppSelector)
│   └── slices/                   # Redux slices por domínio
│       ├── appSlice.ts           # Estado global da aplicação (inicialização)
│       ├── wordsSlice.ts         # Estado de palavras
│       ├── contextsSlice.ts      # Estado de contextos
│       ├── alertsSlice.ts        # Estado de alertas
│       └── statsSlice.ts         # Estado de estatísticas
│
└── pages/                        # Páginas — composição e orquestração de features
    ├── dashboard/
    │   └── Dashboard.tsx         # Página composta: stats, ações rápidas, tabelas
    ├── flashcards/
    │   └── FlashcardsPage.tsx    # Wrapper da feature Flashcards
    ├── quiz/
    │   └── QuizPage.tsx          # Wrapper da feature Quiz
    ├── statistics/
    │   └── StatisticsPage.tsx    # Wrapper da feature Statistics
    ├── ErrorPage.tsx             # Página de erro genérico
    └── NotFoundPage.tsx          # Página 404
```

## 🎯 Princípios da Arquitetura

### 📦 **Separação por Responsabilidade**

- **`app/`**: Configuração, bootstrap e sistema de rotas da aplicação
- **`shared/`**: Recursos reutilizáveis entre features (UI, layout, hooks, utils)
- **`core/`**: Infraestrutura técnica (database, PWA, notifications)
- **`features/`**: Lógica de negócio organizada por domínio funcional
- **`store/`**: Gerenciamento de estado global com Redux Toolkit
- **`pages/`**: Composição de features para páginas e views

### 📄 **Pages vs Features**

Esta é a regra central da arquitetura:

| Camada | Responsabilidade | Conhece |
|---|---|---|
| `pages/` | Orquestra features, define layout de rota | features, shared, store |
| `features/` | Lógica de domínio e componentes autônomos | shared, store |
| `shared/` | Componentes e utilitários genéricos | — |

**Regras:**
- Features **nunca** são registradas diretamente como componentes de rota
- Páginas **não contêm lógica de negócio** — apenas compõem features
- Features **não importam outras features** — comunicação se dá via store Redux

**Exemplo correto:**
```tsx
// ✅ pages/flashcards/FlashcardsPage.tsx — página fina, apenas orquestra
import { Flashcards } from '@/features'
const FlashcardsPage = () => <Flashcards />
export default FlashcardsPage

// ✅ app/router/routes.config.ts — aponta para a página, não para a feature
{ path: AppRoutes.FLASHCARDS, component: FlashcardsPage }

// ❌ routes.config.ts — errado: feature apontada diretamente como rota
import { Flashcards } from '@/features'
{ path: AppRoutes.FLASHCARDS, component: Flashcards }
```

**Quando a página é mais que um wrapper:**
Quando uma página compõe múltiplos features (ex: `Dashboard`), ela orquestra diretamente, importando componentes de diferentes features:
```tsx
// pages/dashboard/Dashboard.tsx
import { WordsSummary } from '@/features/vocabulary'
import { WeekProgress } from '@/features/analytics'
```



Cada feature é organizado de forma autônoma. Os subdiretórios existem conforme a necessidade do domínio:

| Diretório | Propósito |
|---|---|
| `components/` | Componentes React específicos do feature |
| `repositories/` | Acesso direto ao IndexedDB via adapter da `core/database` |
| `services/` | Lógica de negócio que orquestra múltiplos repositories ou operações complexas |
| `utils/` | Funções puras auxiliares sem estado |
| `constants/` | Valores fixos e configurações do domínio |
| `types/` | Definições TypeScript do domínio |
| `index.ts` | Barrel exports para clean imports |

> Nem todo feature precisa de todos os subdiretórios — crie apenas o que for necessário.

### 🏪 **State Management**

O projeto utiliza **Redux Toolkit** para gerenciamento de estado:

- **Store Centralizada**: `store/index.ts` configura a store global
- **Slices**: Cada domínio possui seu próprio slice (words, contexts, alerts, stats)
- **Typed Hooks**: Hooks tipados (`useAppDispatch`, `useAppSelector`) em `store/hooks.ts`
- **Integração**: Features podem ter seus próprios stores locais que se integram à store global

### 🛣️ **Sistema de Rotas**

- **Router React-based**: Sistema de rotas configurável em `app/router/`
- **Configuração Declarativa**: Rotas definidas em `routes.config.ts`
- **Type-Safe**: Tipagem completa do sistema de navegação
- **Hooks de Navegação**: `useAppRouter` para navegação programática

### 🎨 **Design System**

- **Componentes Reutilizáveis**: Sistema de componentes em `shared/ui/`
- **Tokens Semânticos**: Sistema de cores e estilos em `shared/global/global.css`
- **Layout System**: Componentes de layout consistentes (Header, Navigation, Layout)
- **Tema Adaptativo**: Suporte a dark/light mode via `ThemeContext`

### 🚀 **Vantagens da Arquitetura**

1. **Alta Coesão**: Funcionalidades relacionadas permanecem juntas
2. **Baixo Acoplamento**: Features são independentes e intercambiáveis
3. **Escalabilidade**: Fácil adicionar novos features sem impactar os existentes
4. **Manutenibilidade**: Mudanças ficam isoladas em seus respectivos domínios
5. **Testabilidade**: Cada feature pode ser testada independentemente
6. **Clean Imports**: Barrel pattern evita imports complexos
7. **Type Safety**: TypeScript em todos os níveis da aplicação
8. **State Predictability**: Redux garante fluxo de dados previsível

## 📋 **Como Usar**

### Importando Recursos

```typescript
// Features específicos
import { WordsList, useWords } from '@/features/vocabulary/words'
import { AlertsPanel } from '@/features/alerts'
import { Statistics } from '@/features/analytics'

// Componentes compartilhados
import { Button, Modal, Card } from '@/shared/ui'
import { Layout, Header } from '@/shared/layout'

// Hooks compartilhados
import { useApp, useAppRouter, usePWA } from '@/shared/hooks'

// Redux
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addWord, deleteWord } from '@/store/slices/wordsSlice'

// Core services
import { Database } from '@/core/database'
import { NotificationService } from '@/core/notifications'
```

### Adicionando Novo Feature

1. Criar estrutura em `features/[nome-do-feature]/`
   ```
   features/
   └── meu-feature/
       ├── components/    # componentes React do feature
       ├── repositories/  # acesso ao IndexedDB (se necessário)
       ├── services/      # lógica de negócio complexa (se necessário)
       ├── utils/         # funções puras auxiliares (se necessário)
       ├── constants/     # valores fixos do domínio (se necessário)
       ├── types/         # tipos TypeScript do domínio
       └── index.ts       # barrel exports públicos
   ```

2. Implementar componentes e lógica
3. Criar barrel export em `index.ts` (exportar apenas o que é público)
4. Se necessário, adicionar slice à store global em `store/slices/`
5. Adicionar ao `features/index.ts`
6. Configurar rota (se necessário) em `app/router/routes.config.ts`

### Criando uma Nova Página

1. Criar componente em `pages/[nome-da-pagina]/`
2. Compor features necessários
3. Adicionar rota em `app/router/routes.config.ts`
4. Atualizar navegação em `shared/layout/Navigation.tsx`

### Trabalhando com State

```typescript
// Em um componente
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addWord } from '@/store/slices/wordsSlice'

function MyComponent() {
  const dispatch = useAppDispatch()
  const words = useAppSelector((state) => state.words.items)
  
  const handleAddWord = (word: Word) => {
    dispatch(addWord(word))
  }
  
  // ...
}
```

## 🔧 **Padrões e Convenções**

### Nomenclatura

- **Componentes**: PascalCase (`WordsList.tsx`, `AddWordModal.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useWords.ts`, `useAppRouter.ts`)
- **Types**: PascalCase para interfaces/tipos (`Word`, `FullWord`)
- **Files de tipos**: kebab-case (`word.ts`, `alert.ts`)
- **Utils e services**: kebab-case (`format-date.ts`, `export-service.ts`)
- **Constantes**: UPPER_SNAKE_CASE para valores primitivos, kebab-case para arquivos

### Organização de Imports

```typescript
// 1. React e bibliotecas externas
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Store/Redux
import { useAppDispatch } from '@/store/hooks'

// 3. Features
import { WordsList } from '@/features/vocabulary'

// 4. Shared (UI, hooks, utils)
import { Button, Modal } from '@/shared/ui'
import { useApp } from '@/shared/hooks'

// 5. Types
import type { Word } from '@/features/vocabulary/words/types'

// 6. Styles (quando aplicável)
import styles from './styles.module.css'
```

### Barrel Exports

Cada módulo deve ter um `index.ts` que exporta apenas seus recursos públicos:

```typescript
// features/vocabulary/words/index.ts
export * from './components'
export * from './types'
// repositories NÃO são exportados publicamente — acesso via store/slices
```

### Camadas de Acesso a Dados

O fluxo de dados segue uma hierarquia clara:

```
Componente → dispatch(action) → Redux Slice (Thunk) → Repository → IndexedDB (via core/database)
```

- **Componentes** nunca acessam `repositories` diretamente
- **Repositories** são usados exclusivamente pelos **Redux Slices**
- **Services** (`data-management`) orquestram múltiplos repositories para operações complexas

## 🏗️ **Evolução da Arquitetura**

### ✅ Implementado

1. Estrutura modular baseada em features
2. Sistema de rotas configurável com React Router DOM v7
3. State management com Redux Toolkit (slices por domínio)
4. Design system com componentes reutilizáveis
5. Sistema de PWA com service worker (vite-plugin-pwa)
6. Database layer com IndexedDB (adapter próprio)
7. Sistema de notificações e agendamento de alertas
8. Pipeline de qualidade: ESLint + Prettier + Husky + lint-staged
9. Infraestrutura de testes: Vitest + Testing Library

### 🔄 Em Progresso

1. Hooks customizados por feature
2. Otimização de re-renders
3. Lazy loading de features
4. Melhoria de tipos TypeScript

### 📋 Próximos Passos

1. Página `/words` — gerenciamento de palavras estilo planilha (tabela editável inline, drag & drop, filtros, paginação)
2. Implementar testes unitários por feature
3. Adicionar testes de integração
4. Adicionar error boundaries por feature
5. Implementar lazy loading de rotas
6. Adicionar internacionalização (i18n)

## 📚 **Recursos Adicionais**

### Stack Principal

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18 | Framework UI |
| TypeScript | 5 | Tipagem estática |
| Redux Toolkit | 2 | Gerenciamento de estado |
| React Router DOM | 7 | Roteamento |
| Tailwind CSS | 3 | Estilização utility-first |
| Vite | 7 | Build tool e dev server |
| IndexedDB | — | Persistência local (via adapter próprio) |

### Qualidade de Código

| Ferramenta | Propósito |
|---|---|
| ESLint | Linting (inclui plugins: react, react-hooks, tailwindcss, prettier) |
| Prettier | Formatação automática de código |
| Husky | Git hooks (pre-commit) |
| lint-staged | Executa linting apenas nos arquivos staged |
| TypeScript | Type checking via `tsc --noEmit` |

### Testes

| Ferramenta | Propósito |
|---|---|
| Vitest | Test runner (compatível com Vite) |
| @testing-library/react | Utilitários para testar componentes React |
| @testing-library/jest-dom | Matchers adicionais para DOM |
| happy-dom | Ambiente DOM simulado para testes |

### PWA

- **vite-plugin-pwa**: Geração automática de service worker e manifest
- Suporte a instalação e uso offline
- Notificações nativas via Web Notifications API

Esta arquitetura torna o Word Saver **escalável**, **manutenível**, **testável** e **performático**, seguindo as melhores práticas modernas de desenvolvimento React/TypeScript.
