import {
  Archive,
  BookOpen,
  Save,
  CheckSquare,
  Keyboard,
  Brain,
  Bell,
  FileDown,
  Palette
} from 'lucide-react'
import Card from '@/shared/ui/Card'

interface HelpSection {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  items: string[]
}

const sections: HelpSection[] = [
  {
    icon: Archive,
    title: 'Contextos',
    description:
      'Contextos organizam suas palavras em categorias (ex: Inglês, Trabalho, Culinária).',
    items: [
      'Criar: botão "+ Novo" na barra de filtros da página Palavras',
      'Editar: clique com o botão direito no chip do contexto → Editar',
      'Remover: clique com o botão direito no chip do contexto → Remover',
      'Cada contexto tem uma cor de identificação própria'
    ]
  },
  {
    icon: BookOpen,
    title: 'Palavras',
    description:
      'A tabela de palavras é editada diretamente, como uma planilha.',
    items: [
      '"+ Adicionar Linha" cria uma linha em branco no topo da tabela',
      'Duplo clique em qualquer célula para editar o valor',
      'Colar texto separado por Tab (de uma planilha) cria várias linhas de uma vez',
      'Arraste pela alça à esquerda da linha para reordenar',
      'Cada palavra pode ter tags e uma cor própria'
    ]
  },
  {
    icon: Save,
    title: 'Salvando alterações',
    description:
      'Edições ficam pendentes até serem confirmadas — nada é gravado sozinho.',
    items: [
      'O contador de "alterações pendentes" aparece na barra inferior',
      '"Salvar Alterações" (ou Ctrl/Cmd+S) grava tudo de uma vez',
      '"Descartar" cancela todas as edições pendentes',
      'O navegador avisa se você tentar fechar a aba com pendências'
    ]
  },
  {
    icon: CheckSquare,
    title: 'Seleção em massa',
    description: 'Aplique uma ação a várias palavras ao mesmo tempo.',
    items: [
      'Marque linhas pela caixa de seleção; a caixa no cabeçalho seleciona todas da página',
      'Mova as selecionadas para outro contexto pelo menu da barra de ações',
      'Exclua as selecionadas de uma vez (com confirmação antes de apagar)'
    ]
  },
  {
    icon: Keyboard,
    title: 'Atalhos de teclado',
    description: 'Atalhos disponíveis na página Palavras.',
    items: [
      'Ctrl/Cmd+S — salva as alterações pendentes',
      '/ — foca o campo de busca',
      'Delete/Backspace — com linhas selecionadas, abre a confirmação de exclusão em massa',
      'Esc — cancela a confirmação de exclusão ou limpa a seleção atual'
    ]
  },
  {
    icon: Brain,
    title: 'Revisão',
    description: 'Três formas de praticar as palavras salvas.',
    items: [
      'Flashcards — sessão sequencial, vê a palavra e revela a definição',
      'Quiz — perguntas de múltipla escolha sobre suas palavras',
      '"Revisar agora" no Dashboard — revisão avulsa por contexto, sem sair da tela inicial'
    ]
  },
  {
    icon: Bell,
    title: 'Alertas',
    description: 'Lembretes configuráveis para revisar suas palavras.',
    items: [
      'Frequência diária ou semanal, com horário e contextos à sua escolha',
      'Importante: por não ter servidor, os alertas só disparam enquanto o Word Saver estiver aberto em uma aba do navegador'
    ]
  },
  {
    icon: FileDown,
    title: 'Backup dos dados',
    description:
      'Tudo fica salvo só neste navegador — faça backup para não perder nada.',
    items: [
      'Exportar: tudo, por contexto, ou só as palavras (em Configurações)',
      'Importar: mesclar com os dados atuais ou substituir tudo'
    ]
  },
  {
    icon: Palette,
    title: 'Personalização',
    description: 'Ajustes de exibição da página Palavras.',
    items: [
      'Alternar entre tema claro e escuro pelo ícone no cabeçalho',
      'Filtrar por contexto e buscar por palavra ou definição na barra de filtros'
    ]
  }
]

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Como usar o Word Saver
        </h1>
        <p className="text-muted-foreground">
          Um resumo das funcionalidades disponíveis, do cadastro de palavras à
          revisão.
        </p>
      </div>

      {sections.map((section) => {
        const Icon = section.icon
        return (
          <Card key={section.title}>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <Icon className="size-5 text-primary" />
                {section.title}
              </Card.Title>
            </Card.Header>
            <Card.Content className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card.Content>
          </Card>
        )
      })}
    </div>
  )
}
