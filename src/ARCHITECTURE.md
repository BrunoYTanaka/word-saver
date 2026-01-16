# 🏗️ Arquitetura Modular do Word Saver

## 📁 Estrutura do Projeto

```
src/
├── app/                          # Configuração da aplicação
│   ├── App.tsx                   # Componente principal
│   ├── providers/                # Providers globais (futura)
│   └── router/                   # Configuração de rotas (futura)
│
├── shared/                       # Recursos compartilhados
│   ├── ui/                       # Componentes UI reutilizáveis
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── Input/
│   │   ├── Table/
│   │   └── index.ts
│   ├── layout/                   # Componentes de layout
│   │   ├── Header/
│   │   ├── Navigation/
│   │   ├── Layout/
│   │   └── index.ts
│   ├── context/                  # Contextos globais
│   │   ├── AppContext.tsx
│   │   ├── ModalContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/                    # Hooks reutilizáveis
│   │   └── usePWA.ts
│   ├── utils/                    # Utilitários globais
│   │   ├── cn.ts
│   │   └── format-date.ts
│   ├── constants/                # Constantes globais (vazias)
│   ├── types/                    # Tipos globais
│   │   └── globals.d.ts
│   ├── global/                   # Estilos globais
│   └── index.ts
│
├── core/                         # Camada de infraestrutura
│   ├── database/                 # Gerenciamento do IndexedDB
│   │   ├── config/               # Configurações do banco
│   │   ├── core/                 # Classes base (Database, BaseAction)
│   │   └── index.ts
│   ├── notifications/            # Sistema de notificações
│   │   ├── alert-scheduler.ts
│   │   ├── core-notification-service.ts
│   │   └── types.ts
│   ├── pwa/                      # Funcionalidades PWA
│   │   ├── PWAInstallPrompt.tsx
│   │   ├── PWAStatus.tsx
│   │   └── index.ts
│   └── index.ts
│
├── features/                     # Módulos de funcionalidade
│   ├── vocabulary/               # 📚 Vocabulário
│   │   ├── words/
│   │   │   ├── components/       # AddWordModal, EditWordModal, ReviewWordModal
│   │   │   ├── services/         # word-action.ts
│   │   │   ├── types/            # word.d.ts
│   │   │   └── index.ts
│   │   ├── contexts/
│   │   │   ├── components/       # AddContextModal, EditContextModal
│   │   │   ├── services/         # context-action.ts
│   │   │   ├── types/            # context.d.ts
│   │   │   ├── context.ts        # Constantes de contexto
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── learning/                 # 🎓 Aprendizado
│   │   ├── flashcards/
│   │   │   ├── components/       # Flashcards.tsx
│   │   │   └── index.ts
│   │   ├── quiz/
│   │   │   ├── components/       # Quiz.tsx
│   │   │   └── index.ts
│   │   ├── review/               # (vazio - futura funcionalidade)
│   │   └── index.ts
│   │
│   ├── analytics/                # 📊 Análises
│   │   ├── statistics/
│   │   │   ├── components/       # Statistics.tsx
│   │   │   ├── services/         # stats-action.ts
│   │   │   ├── types/            # stats.d.ts
│   │   │   └── index.ts
│   │   ├── progress/             # (vazio - futura funcionalidade)
│   │   └── index.ts
│   │
│   ├── alerts/                   # 🔔 Alertas
│   │   ├── components/           # AddAlertModal, EditAlertModal
│   │   ├── services/             # alert-action.ts
│   │   ├── types/                # alert.d.ts
│   │   └── index.ts
│   │
│   ├── data-management/          # 💾 Gestão de Dados
│   │   ├── export/
│   │   │   ├── components/       # ExportDataModal
│   │   │   ├── services/         # export-action.ts
│   │   │   └── index.ts
│   │   ├── import/
│   │   │   ├── components/       # ImportDataModal
│   │   │   ├── services/         # import-action.ts
│   │   │   └── index.ts
│   │   ├── backup/               # (vazio - futura funcionalidade)
│   │   ├── file/                 # Serviços de arquivo (helpers, actions)
│   │   └── index.ts
│   │
│   ├── settings/                 # ⚙️ Configurações
│   │   ├── components/           # SettingsModal
│   │   ├── services/             # settings-action.ts
│   │   ├── types/                # settings.d.ts
│   │   └── index.ts
│   │
│   └── index.ts                  # Exports centrais
│
└── pages/                        # Features compostas
    ├── dashboard/                # Dashboard.tsx (combina múltiplos features)
    └── onboarding/               # (vazio - futura funcionalidade)
```

## 🎯 Princípios da Arquitetura

### 📦 **Separação por Responsabilidade**

- **`app/`**: Configuração e bootstrap da aplicação
- **`shared/`**: Recursos reutilizáveis entre features
- **`core/`**: Infraestrutura técnica (database, PWA, notifications)
- **`features/`**: Lógica de negócio organizada por domínio
- **`pages/`**: Composição de features para páginas complexas

### 🔄 **Feature-Based Organization**

Cada feature contém:

- **`components/`**: Componentes React específicos
- **`services/`**: Lógica de negócio e acesso a dados
- **`types/`**: Definições TypeScript
- **`hooks/`**: Hooks customizados (futuros)
- **`index.ts`**: Barrel exports para clean imports

### 🚀 **Vantagens**

1. **Coesão**: Funcionalidades relacionadas ficam juntas
2. **Baixo Acoplamento**: Features são independentes
3. **Escalabilidade**: Fácil adicionar novos features
4. **Manutenibilidade**: Mudanças ficam isoladas
5. **Testabilidade**: Cada feature pode ser testada independentemente
6. **Clean Imports**: Barrel pattern para imports limpos

## 📋 **Como Usar**

### Importando Features

```typescript
// De um feature específico
import { AddWordModal, WordService } from '../features/vocabulary/words'

// De múltiplos features
import { Flashcards } from '../features/learning'
import { Statistics } from '../features/analytics'

// Componentes compartilhados
import { Button, Modal } from '../shared/ui'
import { Layout } from '../shared/layout'
```

### Adicionando Novo Feature

1. Criar pasta em `features/[nome-do-feature]`
2. Criar subpastas: `components/`, `services/`, `types/`, `hooks/`
3. Implementar funcionalidades
4. Criar `index.ts` com exports
5. Adicionar ao `features/index.ts`

## 🔧 **Próximos Passos**

1. ✅ Estrutura criada e arquivos movidos
2. 🔄 **Em andamento**: Corrigir imports quebrados
3. ⏳ Implementar Repository Pattern nos services
4. ⏳ Adicionar Custom Hooks por feature
5. ⏳ Implementar Lazy Loading
6. ⏳ Adicionar testes unitários por feature

Esta arquitetura torna o Word Saver mais **escalável**, **manutenível** e **organizável**, seguindo padrões modernos de desenvolvimento React/TypeScript.
