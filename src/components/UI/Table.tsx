import { Edit, Trash2 } from 'lucide-react'
import { useContext } from 'react'
import AppContext from '../../context/AppContext'

interface Data {
  id: number
  word: string
  definition: string
  context: string
  alerts: number
}

interface Column {
  title: string
  field: string
}

interface TableProps {
  data?: Array<Data>
  columns?: Array<Column>
}

function Table({ data, columns }: TableProps) {
  const { deleteWord } = useContext(AppContext)

  const COLUMNS = columns || [
    {
      title: 'Palavras',
      field: 'word'
    },
    {
      title: 'Definições',
      field: 'definition'
    },
    {
      title: 'Contextos',
      field: 'context'
    },
    {
      title: 'Alertas',
      field: 'alerts'
    },
    {
      title: 'Ações',
      field: 'actions'
    }
  ]

  const DATA = data || [
    {
      id: 0,
      word: 'Serendipidade',
      definition:
        'A ocorrência de eventos por acaso de forma feliz ou benéfica',
      context:
        'Encontrei este livro por serendipidade enquanto navegava na biblioteca.',
      alerts: 3
    },
    {
      id: 1,
      word: 'Ubíquo',
      definition: 'Presente, aparecendo ou encontrado em todos os lugares',
      context: 'Os smartphones se tornaram ubíquos na sociedade moderna.',
      alerts: 0
    },
    {
      id: 2,
      word: 'Efêmero',
      definition: 'Que dura por um tempo muito curto',
      context:
        'A beleza das flores de cerejeira é efêmera, durando apenas algumas semanas.',
      alerts: 2
    },
    {
      id: 3,
      word: 'Melífluo',
      definition: 'Doce ou musical; agradável de ouvir',
      context: 'Sua voz melíflua cativou toda a audiência.',
      alerts: 1
    },
    {
      id: 4,
      word: 'Perspicaz',
      definition: 'Que tem percepção aguçada e compreensão das coisas',
      context: 'A análise perspicaz do detetive resolveu o caso rapidamente.',
      alerts: 4
    },
    {
      id: 5,
      word: 'Quintessencial',
      definition:
        'Representando o exemplo mais perfeito de uma qualidade ou classe',
      context:
        'A pizza é o prato quintessencial italiano conhecido mundialmente.',
      alerts: 0
    }
  ]

  return (
    <>
      <div className="relative flex size-full flex-col overflow-auto rounded-lg bg-card bg-clip-border shadow-md dark:border-border">
        <table className="w-full min-w-max table-auto border-collapse text-left">
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.field}
                  className="border-primary-300 border-b p-4 dark:border-secondary"
                >
                  <p className="block text-sm font-normal leading-none text-muted-foreground">
                    {column.title}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATA.map((item, index) => (
              <tr
                key={item.id}
                className={`hover:bg-secondary ${
                  DATA.length - 1 > index ? 'border-b border-secondary' : ''
                }`}
              >
                <td className="p-4 py-5">
                  <p className="block text-sm font-semibold text-secondary-foreground">
                    {item.word}
                  </p>
                </td>
                <td className="p-4 py-5">
                  <p
                    className="block max-w-xs truncate text-sm text-secondary-foreground"
                    title={item.definition}
                  >
                    {item.definition}
                  </p>
                </td>
                <td className="p-4 py-5">
                  <p
                    className="block max-w-xs truncate text-sm text-secondary-foreground"
                    title={item.context}
                  >
                    {item.context}
                  </p>
                </td>
                <td className="p-4 py-5">
                  <span
                    title="Números de alertas associados à palavra"
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      item.alerts === 0
                        ? 'bg-green-100 text-green-500'
                        : item.alerts <= 2
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.alerts}
                  </span>
                </td>
                <td className="p-4 py-5">
                  <button
                    onClick={() => console.log('Editar', item.word)}
                    title="Editar Palavra"
                    type="button"
                    className="cursor-pointer rounded-md border-none bg-transparent text-sm text-blue-600 hover:bg-blue-100 dark:text-blue-400"
                  >
                    <Edit className="size-4" />
                  </button>
                  <button
                    onClick={() => deleteWord(item.id)}
                    title="Remover Palavra"
                    type="button"
                    className="cursor-pointer rounded-md border-none bg-transparent text-sm text-red-600 hover:bg-red-100 dark:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Table
