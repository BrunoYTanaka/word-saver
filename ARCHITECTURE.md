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
│       ├── routes.config.ts      # Configuração de rotas
│       └── types.ts              # Tipos do sistema de rotas
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
│   │   ├── Navigation.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── Layout.tsx
│   │   └── index.ts
│   ├── context/                  # Contextos globais
│   │   ├── ModalContext.tsx      # Gerenciamento de modais
│   │   ├── ThemeContext.tsx      # Gerenciamento de tema
│   │   └── index.ts
│   ├── hooks/                    # Hooks reutilizáveis
│   │   ├── useApp.ts             # Hook principal da aplicação
│   │   ├── useAppRouter.ts       # Hook de navegação
│   │   ├── usePWA.ts             # Hook para PWA
│   │   ├── useStorage.ts         # Hook para localStorage
│   │   └── index.ts
│   ├── utils/                    # Utilitários globais
│   │   ├── cn.ts                 # Utilitário para classes CSS
│   │   ├── format-date.ts        # Formatação de datas
│   │   └── index.ts
│   ├── types/                    # Tipos globais
│   │   ├── globals.d.ts          # Declarações TypeScript globais
│   │   └── index.ts
│   ├── global/                   # Estilos globais
│   │   └── global.css            # CSS global e tokens
│   └── index.ts
│
├── core/                         # Camada de infraestrutura
│   ├── database/                 # Gerenciamento do IndexedDB
│   │   ├── config/
│   │   │   └── database.ts       # Configurações do banco
│   │   ├── core/
│   │   │   ├── adapter.ts        # Adapter para IndexedDB
│   │   │   ├── database.ts       # Classe base do database
│   │   │   └── schemas.ts        # Schemas do banco
│   │   └── index.ts
│   ├── notifications/            # Sistema de notificações
│   │   └── notification/
│   │       ├── alert-scheduler.ts           # Agendamento de alertas
│   │       ├── core-notification-service.ts # Serviço de notificações
│   │       ├── types.ts                     # Tipos de notificações
│   │       └── index.ts
│   ├── pwa/                      # Funcionalidades PWA
│   │   ├── PWAInstallPrompt.tsx  # Prompt de instalação
│   │   ├── PWAStatus.tsx         # Status do PWA
│   │   └── index.ts
│   └── index.ts
│
├── features/                     # Módulos de funcionalidade
│   ├── vocabulary/               # 📚 Vocabulário
│   │   ├── words/
│   │   │   ├── components/       # Componentes de palavras
│   │   │   ├── hooks/            # Hooks customizados
│   │   │   ├── stores/           # Redux stores
│   │   │   └── types/            # Tipos TypeScript
│   │   ├── contexts/
│   │   │   ├── components/       # Componentes de contextos
│   │   │   ├── hooks/            # Hooks customizados
│   │   │   ├── stores/           # Redux stores
│   │   │   └── types/            # Tipos TypeScript
│   │   └── index.ts
│   │
│   ├── learning/                 # 🎓 Aprendizado
│   │   ├── flashcards/
│   │   │   ├── components/       # Flashcards.tsx
│   │   │   └── index.ts
│   │   ├── quiz/
│   │   │   ├── components/       # Quiz.tsx
│   │   │   └── index.ts
│   │   ├── review/               # Sistema de revisão
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── analytics/                # 📊 Análises e Estatísticas
│   │   ├── statistics/
│   │   │   ├── components/       # Componentes de estatísticas
│   │   │   ├── hooks/            # Hooks customizados
│   │   │   ├── stores/           # Redux stores
│   │   │   ├── types/            # Tipos TypeScript
│   │   │   └── index.ts
│   │   ├── progress/             # Progresso de aprendizado
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── alerts/                   # 🔔 Alertas e Notificações
│   │   ├── components/           # AddAlertModal, EditAlertModal
│   │   ├── stores/               # Redux stores
│   │   │   └── alert-store.ts
│   │   ├── types/                # Tipos TypeScript
│   │   │   └── alert.ts
│   │   └── index.ts
│   │
│   ├── data-management/          # 💾 Gestão de Dados
│   │   ├── export/
│   │   │   ├── components/       # ExportDataModal
│   │   │   └── index.ts
│   │   ├── import/
│   │   │   ├── components/       # ImportDataModal
│   │   │   └── index.ts
│   │   ├── backup/               # Backup de dados
│   │   │   ├── stores/           # Redux stores
│   │   │   ├── types/            # Tipos TypeScript
│   │   │   └── index.ts
│   │   ├── file/                 # Operações de arquivo
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── settings/                 # ⚙️ Configurações
│   │   ├── components/           # SettingsModal
│   │   ├── stores/               # Redux stores
│   │   ├── types/                # Tipos TypeScript
│   │   └── index.ts
│   │
│   └── index.ts                  # Exports centrais de features
│
├── store/                        # State Management Global (Redux)
│   ├── index.ts                  # Configuração da store
│   ├── hooks.ts                  # Hooks tipados do Redux
│   └── slices/                   # Redux slices
│       ├── appSlice.ts           # Estado global da aplicação
│       ├── wordsSlice.ts         # Estado de palavras
│       ├── contextsSlice.ts      # Estado de contextos
│       ├── alertsSlice.ts        # Estado de alertas
│       └── statsSlice.ts         # Estado de estatísticas
│
└── pages/                        # Páginas e Views
    ├── dashboard/                # Dashboard principal
    │   └── Dashboard.tsx         # Combina múltiplos features
    ├── ErrorPage.tsx             # Página de erro
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

### 🔄 **Feature-Based Organization**

Cada feature é organizado de forma autônoma contendo:

- **`components/`**: Componentes React específicos do feature
- **`hooks/`**: Hooks customizados para lógica reutilizável
- **`stores/`**: Redux slices para gerenciamento de estado local
- **`types/`**: Definições TypeScript do domínio
- **`index.ts`**: Barrel exports para clean imports

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
       ├── components/
       ├── hooks/
       ├── stores/
       ├── types/
       └── index.ts
   ```

2. Implementar componentes e lógica
3. Criar barrel export em `index.ts`
4. Se necessário, adicionar slice à store global
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
- **Types**: PascalCase (`Word.ts`, `Alert.ts`)
- **Utils**: camelCase (`format-date.ts`, `cn.ts`)
- **Constantes**: UPPER_SNAKE_CASE quando apropriado

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
import type { Word } from '@/features/vocabulary/types'

// 6. Styles
import styles from './styles.module.css'
```

### Barrel Exports

Cada módulo deve ter um `index.ts` que exporta seus recursos públicos:

```typescript
// features/vocabulary/words/index.ts
export * from './components'
export * from './hooks'
export * from './types'
```

## 🏗️ **Evolução da Arquitetura**

### ✅ Implementado

1. Estrutura modular baseada em features
2. Sistema de rotas configurável
3. State management com Redux Toolkit
4. Design system com componentes reutilizáveis
5. Sistema de PWA com service workers
6. Database layer com IndexedDB
7. Sistema de notificações

### 🔄 Em Progresso

1. Hooks customizados por feature
2. Otimização de re-renders
3. Lazy loading de features
4. Melhoria de tipos TypeScript

### 📋 Próximos Passos

1. Implementar testes unitários por feature
2. Adicionar testes de integração
3. Implementar Repository Pattern completo
4. Adicionar error boundaries por feature
5. Implementar sistema de analytics
6. Adicionar internacionalização (i18n)
7. Melhorar sistema de cache

## 📚 **Recursos Adicionais**

- **TypeScript**: Tipagem forte em toda aplicação
- **Redux Toolkit**: Gerenciamento de estado moderno e eficiente
- **Vite**: Build tool rápido e otimizado
- **Tailwind CSS**: Utility-first CSS framework
- **PWA**: Service workers para funcionalidade offline

Esta arquitetura torna o Word Saver **escalável**, **manutenível**, **testável** e **performático**, seguindo as melhores práticas modernas de desenvolvimento React/TypeScript.
