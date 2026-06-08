# Feature: Página de Gerenciamento de Palavras (`/words`)

## Visão Geral

Criação de uma página dedicada ao gerenciamento completo de palavras, substituindo o fluxo atual de modais encadeadas. A página apresenta uma tabela interativa no estilo planilha que permite criar, visualizar, editar e excluir palavras com agilidade, suportando edição inline e adição de múltiplas palavras de uma vez.

---

## Motivação

O fluxo atual exige abrir 2–3 modais em sequência para cadastrar uma única palavra, especialmente quando nenhum contexto existe. Isso cria fricção desnecessária e torna o cadastro em lote inviável. Uma página dedicada com tabela editável resolve esses problemas dando espaço horizontal adequado e tornando operações comuns em ações de 1 clique.

---

## Rota

```
/words
```

Adicionada ao `AppRoutes` e ao `routesConfig`. Incluída na navegação lateral/inferior com ícone `BookOpen`.

---

## Dependências

| Pacote | Uso |
|---|---|
| `@tanstack/react-table` | Engine da tabela (sorting, filtering, pagination) |
| `@dnd-kit/core` + `@dnd-kit/sortable` | Drag & drop de linhas |

---

## Layout da Página

```
┌─────────────────────────────────────────────────────────┐
│ Palavras                              [+ Adicionar Linha] │
├──────────────┬──────────────────────────────────────────┤
│ Filtros:     │ [Todos os Contextos ▼]  [Buscar palavra…] │
├──┬───────────┬──────────────┬──────────┬───────┬────────┤
│⠿ │ Palavra ↕ │ Definição  ↕ │ Contexto │ Tags  │ Ações  │
├──┼───────────┼──────────────┼──────────┼───────┼────────┤
│⠿ │ ephemeral │ Lasting for… │ English  │ adj   │ 🗑     │
│⠿ │ seren…    │              │ English  │       │ 🗑     │
└──┴───────────┴──────────────┴──────────┴───────┴────────┘
│ Mostrando 1–25 de 80   [ < 1 2 3 4 > ]    [25 ▼ / pág] │
└─────────────────────────────────────────────────────────┘
              [Salvar Alterações (3 pendentes)]
```

---

## Funcionalidades

### 1. Tabela Interativa

#### Edição Inline
- **Double click** em qualquer célula entra em modo de edição
- **Tab** avança para a próxima célula editável na mesma linha
- **Enter** confirma e sai do modo de edição
- **Escape** cancela a edição e restaura o valor anterior
- Células em edição têm visual diferenciado (borda destacada)

#### Tipos de Coluna

| Coluna | Tipo | Comportamento de Edição |
|---|---|---|
| `word` | `text` | Input de texto simples, obrigatório |
| `definition` | `textarea` | Textarea expansível, opcional |
| `contextId` | `select` | Dropdown com contextos existentes + opção "＋ Criar contexto" inline |
| `tags` | `tags` | Input com chips, separados por vírgula ou Enter |
| `rowColor` | `color` | Color picker compacto que pinta o fundo da linha |
| Ações | — | Botão de exclusão |

#### Cor da Linha
- Coluna especial com um swatch colorido clicável
- Abre um color picker inline (paleta de cores predefinidas + custom hex)
- A cor selecionada aplica um fundo sutil na linha inteira
- Valor armazenado no campo `color` da palavra

### 2. Adição de Palavras

- Botão **"+ Adicionar Linha"** no header insere uma nova linha vazia no topo da tabela
- A linha nova entra automaticamente em modo de edição no campo `word`
- Apenas o campo `word` é obrigatório para salvar
- Múltiplas linhas podem ser adicionadas antes de salvar

#### Paste de Planilha
- Ao colar (`Ctrl+V`) na tabela, detecta conteúdo com tabulações (`\t`)
- Distribui automaticamente nas colunas: `word \t definition \t tags`
- Cria múltiplas linhas de uma vez, compatível com Excel e Google Sheets

### 3. Exclusão

- Botão 🗑 na coluna de ações de cada linha
- Abre um **popover de confirmação** inline (não modal) com "Cancelar" e "Confirmar exclusão"
- Exclusão em lote: checkbox na primeira coluna permite selecionar múltiplas linhas e deletar de uma vez via botão flutuante que aparece no footer

### 4. Drag & Drop de Linhas

- Handle `⠿` na primeira coluna permite arrastar e soltar linhas para reordenar
- A ordem é preservada e salva como campo `order` na palavra
- Visual de arrastar com sombra e indicador de posição

### 5. Ordenação de Colunas

- Clique no header da coluna alterna entre: sem ordem → crescente (↑) → decrescente (↓)
- Colunas ordenáveis: `word`, `definition`, `contextId`, `reviewCount`, `createdAt`
- Indicador visual de direção no header

### 6. Filtros

- **Filtro por contexto**: chips/dropdown no header da página. Selecionar um ou mais contextos filtra as linhas
- **Busca por texto**: input de busca que filtra pelo campo `word` e `definition` em tempo real (debounce 300ms)
- Filtros são combinados (AND)
- Badge com contagem de filtros ativos e botão "Limpar filtros"

### 7. Paginação

- Paginação no footer da tabela
- **Opções de itens por página**: 10 / 25 / 50 / 100 (seletor dropdown)
- Controles de navegação: Primeira, Anterior, páginas numeradas, Próxima, Última
- Exibição: "Mostrando X–Y de Z palavras"
- Ao filtrar, reseta para a página 1
- A preferência de itens por página é persistida no `localStorage`

### 8. Salvamento

- As alterações são acumuladas em um estado local "pendente" (não disparam o store imediatamente)
- Um **footer fixo** aparece quando há alterações pendentes, mostrando o contador ("3 alterações pendentes")
- Botão **"Salvar Alterações"** despacha todas as mudanças para o store/storage de uma vez
- Botão **"Descartar"** reverte todas as mudanças pendentes ao estado original
- Ao tentar navegar para outra rota com alterações pendentes, exibe um alerta de confirmação

---

## Impacto no Dashboard

- A aba **"Palavras"** na tabela do Dashboard é **removida** (a informação agora vive em `/words`)
- O quick action **"Adicionar Palavra"** passa a navegar para `/words` em vez de abrir modal
- A modal `AddWordModal` continua existindo para contextos onde uma adição rápida isolada faz sentido (ex: futuras extensões de browser)
- O card de stats "Total de Palavras" mantém link para `/words`

---

## Impacto na Navegação

Novo item adicionado ao `Navigation` (mobile bottom bar) e ao sidebar desktop:

```ts
{
  icon: BookOpen,
  label: 'Palavras',
  path: '/words'
}
```

---

## Estrutura de Arquivos

```
src/
├── app/router/
│   ├── routes.config.ts        # + rota /words
│   └── types.ts                # + AppRoutes.WORDS
├── pages/
│   └── words/
│       └── WordsPage.tsx       # página principal
└── features/vocabulary/words/
    └── components/
        ├── WordsTable.tsx              # tabela principal (TanStack)
        ├── WordsTableRow.tsx           # linha editável
        ├── WordsTableToolbar.tsx       # header com filtros e botão adicionar
        ├── WordsTablePagination.tsx    # footer de paginação
        ├── WordsTableSaveBar.tsx       # footer de salvar/descartar
        └── cells/
            ├── TextCell.tsx            # edição de texto simples
            ├── TextareaCell.tsx        # edição de textarea
            ├── SelectCell.tsx          # seletor de contexto
            ├── TagsCell.tsx            # chips de tags
            └── ColorCell.tsx           # color picker de linha
```

---

## Modelo de Dados

Nenhuma mudança breaking no modelo `FullWord`. Adições opcionais:

```ts
interface FullWord {
  // campos existentes...
  color?: string   // cor de destaque da linha (hex ou CSS var)
  order?: number   // posição após drag & drop
}
```

---

## Fora de Escopo (v1)

- Colunas dinâmicas criadas pelo usuário (estilo Airtable)
- Import/export de CSV
- Histórico de alterações (undo/redo)
- Comentários por linha
