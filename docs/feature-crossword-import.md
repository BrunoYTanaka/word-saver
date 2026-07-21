# Avaliação: Importar Palavras Cruzadas por Foto

> Este documento é uma **avaliação de viabilidade e complexidade**, não uma especificação de implementação aprovada. Nenhum código foi escrito ainda.

## Visão Geral

Ideia avaliada: o usuário envia uma foto (ou, alternativamente, uma URL) de uma página de palavra cruzada, e o app extrai as dicas — sem a palavra-resposta — salvando cada uma como uma entrada de vocabulário pendente, para o usuário preencher a palavra manualmente depois.

---

## Restrição Arquitetural

Word Saver é um PWA **sem backend**, sem chamadas HTTP para dados (ver `CLAUDE.md`). Isso descarta, de saída, usar uma API de visão computacional (ex.: Claude/GPT vision) para ler a imagem inteira — a opção mais precisa tecnicamente não é compatível com a arquitetura atual do projeto.

**Decisão de escopo**: o OCR deve rodar 100% no cliente (navegador), via uma biblioteca WASM (ex.: Tesseract.js), aceitando menor precisão em troca de manter o app 100% offline e sem backend.

---

## Avaliação de Complexidade: **Alta**

Não é "muito alta" — não há replatforming de dados nem sincronização — mas é a maior superfície nova a entrar no app até hoje, pois introduz três categorias de infraestrutura inexistentes: captura de imagem, OCR em WASM/Worker, e um novo conceito de dado ("palavra pendente"). Hoje não existe nenhuma infraestrutura de imagem, OCR, câmera ou arquivo no projeto (além do import de JSON).

### Divisão de esforço (relativo)

| Parte | Esforço | Observação |
|---|---|---|
| Captura de imagem (`<input type="file" accept="image/*" capture="environment">`) | Baixo | Mesmo padrão já usado no import de JSON (`ImportDataModal.tsx`) |
| Integração OCR (Tesseract.js, worker, progress, lazy-load, ajuste do PWA precache) | Médio-Alto | Dependência nova (WASM/worker) para o repo; exige cuidado com bundle size |
| Parsing/segmentação das dicas (Across/Down, números, ruído de OCR) | Médio para codar, **mas com retorno limitado** | Boa parte do esforço é ajuste empírico contra fotos reais, não código |
| Novo campo `status: 'pending'` em `Word` + ajustes de UI (validação, filtro, estilo de linha) | Médio | Mexe em `useWordsTableColumns.tsx`, que hoje trata `word` como sempre obrigatório |
| Etapa de revisão/edição antes de salvar | Médio-Alto | É o "portão de qualidade" da feature — não é opcional dada a precisão do OCR |
| Redux/thunk/repositório (`addPendingWords`) | Baixo | Segue padrão já existente em `wordsSlice.ts`/`word-store.ts` |

### Por que a extração nunca será 100% automática

Dicas de palavras cruzadas costumam vir em colunas duplas, texto pequeno/denso, às vezes fotografadas em ângulo. OCR local (Tesseract.js) tende a embaralhar a ordem das colunas e errar dígitos/letras nesse tipo de layout — isso é uma **limitação estrutural**, não um bug corrigível com mais regex. Por isso, uma etapa de revisão manual (lista editável das dicas antes de salvar) é **obrigatória**, não um extra de polimento.

---

## Abordagem Recomendada (se a feature avançar)

### Estrutura de módulo

```
src/features/vocabulary/crossword-import/
├── components/
│   ├── ImportCrosswordModal.tsx      # wizard: captura → OCR → revisão → salvar
│   ├── steps/CaptureStep.tsx
│   ├── steps/ProcessingStep.tsx      # progress bar do OCR
│   └── steps/ReviewCluesStep.tsx     # lista editável das dicas extraídas
├── hooks/useCrosswordImport.ts       # estado local do wizard (não vai pro Redux)
├── services/ocr-service.ts           # chama core/ocr, alimenta o parser
├── services/clue-parser.ts           # texto OCR bruto -> Clue[] (lógica pura, testável)
└── types/crossword-import.ts
```

- Novo módulo técnico `core/ocr/` — wrapper genérico do Tesseract.js (worker lifecycle, progress), sem conhecimento de "palavra cruzada" — é infraestrutura, igual `core/database`.
- Novo modal `IMPORT_CROSSWORD` registrado em `ModalPropsMap` (`src/shared/context/ModalContext.tsx`), acionado por um botão em `WordsTableToolbar.tsx`. Nenhuma rota/página nova.

### Modelo de dado

Adicionar `status?: 'pending' | 'complete'` em `Word` (`src/features/vocabulary/words/types/word.ts`), em vez de tornar `word` opcional — evita revisar todo lugar que hoje assume `word.word.toLowerCase()` sem guard. Campo aditivo, sem migração/bump de `DB_VERSION`. Ajustar `useWordsTableColumns.tsx` para tornar a validação `required` condicional a `status !== 'pending'`, reaproveitando a edição inline já existente da tabela para o preenchimento posterior — sem modal novo de "preencher palavra".

### OCR e parsing

- `tesseract.js` carregado via `import()` dinâmico, só quando o modal é aberto — nunca no bundle principal.
- Downscale da foto (canvas, ~1500-2000px) antes do OCR para reduzir tempo/memória.
- Ajustar `workbox.globPatterns` (`vite.config.ts`) para não forçar precache pesado do `.wasm`/`.traineddata` na instalação do PWA.
- `clue-parser.ts`: função pura que separa texto bruto em `Clue[]` (detecção fuzzy de cabeçalhos ACROSS/DOWN, split por número de dica). Tratado como "melhor esforço", nunca como extração final.
- `ReviewCluesStep.tsx` obrigatório: lista editável (editar/excluir/mesclar/dividir linhas) + textarea com o texto OCR bruto para correção manual.

### Redux/repositório

- Novo thunk `addPendingWords` em `wordsSlice.ts`, seguindo o padrão pending/fulfilled/rejected de `addWord`.
- Insert em lote via `Promise.all` sobre `addWord` existente (mesmo padrão de `WordsPage.tsx handleSave`) — sem necessidade de transação IndexedDB única para o volume esperado (dezenas de dicas).

### Ferramentas necessárias para implementar

- Nova dependência npm: `tesseract.js` (única lib nova necessária).
- A precisão do OCR **não é testável via Vitest/happy-dom** (sem WASM/Worker/Canvas real no ambiente de teste) — validação exige teste manual em fotos reais (2-3 fotos, ângulos/layouts diferentes). Não há Playwright neste projeto hoje; não vale a pena introduzir só para isso.
- Nenhuma ferramenta/serviço externo (API keys) é necessário — é isso que torna essa abordagem compatível com as regras do projeto.

---

## Alternativa de Input: URL em vez de Foto

Avaliada a possibilidade de o usuário colar uma URL em vez de enviar uma foto. Só funciona em um caso estreito, não generaliza:

- **Link direto para uma imagem** (ex.: `.jpg`/`.png` hospedada com CORS aberto): tecnicamente viável — o navegador busca a imagem e passa pro Tesseract.js como um upload comum. Mas se o servidor da imagem não enviar `Access-Control-Allow-Origin`, o canvas fica "tainted" e o OCR não consegue ler os pixels (erro de segurança do navegador) — depende inteiramente da configuração do host de terceiros.
- **Link de uma página de palavra cruzada** (ex.: site de jornal): não dá para buscar direto do navegador sem servidor. `fetch()` de HTML de outro domínio esbarra em CORS quase sempre. Contornar isso exigiria um proxy backend — o que reabre a mesma tensão: o projeto deixaria de ser "sem backend".

**Conclusão**: URL como input não é uma alternativa que evita a necessidade de backend; é o mesmo obstáculo com outra cara, e só cobre o caso raro de imagem já hospedada com CORS liberado.

---

## E se quiséssemos *resolver* a palavra cruzada de verdade (não só extrair as dicas)?

Resolver a palavra cruzada (preencher as respostas corretas, respeitando letras cruzadas) é um problema de ordem de grandeza mais difícil do que extrair dicas, e envolve duas frentes novas:

1. **Detectar a grade** — identificar quadros pretos/brancos e numeração a partir da foto. Isso é visão computacional (detecção de linhas/contornos), não OCR de texto, e é sujeito a erro com foto em ângulo, sombra, etc.
2. **Adivinhar a resposta certa para cada dica, respeitando interseções** — um problema essencialmente de conhecimento/linguagem. Solvers reais de palavra cruzada (ex.: Dr.Fill, que só superou campeões humanos em 2021) combinam um banco de dados gigante de dicas-respostas históricas, um modelo de linguagem grande, e um solver de restrições para casar letras cruzadas. É pesquisa de ponta, não uma feature de app.

### O que precisaria mudar no projeto para isso ser possível

- **Abandonar "sem backend/sem HTTP"** para essa feature específica — trocar OCR local por uma chamada a um modelo multimodal (ex.: Claude com visão), que leria grade + dicas em uma passada só e tentaria responder usando conhecimento geral.
- **O obstáculo real: onde guardar uma API key com segurança.** Sem servidor, não há onde esconder uma chave — qualquer chave embutida no cliente fica exposta. Duas opções:
  - **BYOK (bring your own key)**: o usuário cola a própria chave de API nas configurações, guardada localmente (IndexedDB), chamada feita direto do navegador. Mantém "sem backend nosso", mas quebra "no HTTP data calls" e expõe a chave do usuário no tráfego do próprio dispositivo — aceitável só como decisão consciente de mudança de princípio arquitetural.
  - **Backend proxy real**: um servidor guarda a chave e repassa a chamada — contradiz a arquitetura atual do projeto ("PWA sem backend").
- **Verificação de restrições cruzadas**: mesmo com boas respostas individuais, letras que se cruzam entre "horizontais" e "verticais" podem não bater — seria necessário um passo de constraint-solving e possivelmente reconsultar o modelo em caso de conflito.
- **Mudanças concretas**: novo módulo `core/ai` (chamadas HTTP, categoria de infra inexistente hoje), tela de configuração para a API key (o tipo `Settings` do projeto é `{ [key: string]: string }`, já listado como candidato a tipagem mais específica em `CLAUDE.md`), tratamento de estado offline/erro de rede (hoje o app assume que tudo funciona sem internet).

### Conclusão

A versão "extrair dicas + preencher manual" é o escopo realista dentro das restrições atuais do app. "Resolver sozinho" exigiria uma mudança de princípio arquitetural (aceitar chamadas de rede/BYOK) e, mesmo assim, não teria garantia de acerto total — permanece fora de escopo recomendado para este projeto.

---

## Arquivos Críticos (referência para implementação futura)

- `src/features/vocabulary/words/types/word.ts`
- `src/features/vocabulary/words/repositories/word-store.ts`
- `src/store/slices/wordsSlice.ts`
- `src/features/vocabulary/words/hooks/useWordsTableColumns.tsx`
- `src/shared/context/ModalContext.tsx`
- `src/core/database/core/schemas.ts`
- `vite.config.ts`

---

## Fora de Escopo

- Resolução automática das respostas (ver seção acima)
- Live camera capture (`getUserMedia`) — o `<input capture="environment">` já cobre o caso de uso via file picker nativo do celular
- Suporte a URL como input (ver seção "Alternativa de Input")
