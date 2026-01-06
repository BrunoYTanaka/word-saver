import { Edit, Trash2 } from 'lucide-react'

interface DataItem {
  id: string
  alerts?: number
  color?: string
}

type SpecialColumn = 'actions' | 'alerts' | 'color'

interface Column<T> {
  title: string
  field: keyof T | SpecialColumn
}

interface TableProps<T extends object> {
  data: Array<T & DataItem>
  columns: Array<Column<T>>
  onEdit: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function Table<T extends object>({
  data,
  columns,
  onEdit,
  onDelete
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex w-full items-center justify-center rounded-lg bg-card bg-clip-border p-10 text-sm text-muted-foreground shadow-md dark:border-border">
        Nenhum dado disponível.
      </div>
    )
  }

  return (
    <div className="relative flex size-full flex-col overflow-auto rounded-lg bg-card bg-clip-border shadow-md dark:border-border">
      <table className="w-full min-w-max table-auto border-collapse text-left">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.field)}
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
          {data.map((item, index) => (
            <tr
              key={item.id}
              className={`hover:bg-secondary ${
                data.length - 1 > index ? 'border-b border-secondary' : ''
              }`}
            >
              {columns.map((column) => {
                if (column.field === 'actions') {
                  return (
                    <td key="actions" className="space-x-2 p-4 py-5">
                      <button
                        onClick={() => onEdit(item.id)}
                        title="Editar"
                        type="button"
                        className="rounded-md p-1 text-blue-600 hover:bg-blue-200 dark:text-blue-400"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        title="Remover"
                        type="button"
                        className="rounded-md p-1 text-red-600 hover:bg-red-200"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  )
                }

                if (column.field === 'alerts') {
                  return (
                    <td key="alerts" className="p-4 py-5">
                      {item.alerts !== undefined && (
                        <span
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
                      )}
                    </td>
                  )
                }

                if (column.field === 'color') {
                  return (
                    <td key={String(column.field)} className="p-4 py-5">
                      <div className="flex items-center">
                        <div
                          className="mr-2 inline-block size-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                          title={`Cor ${item.color}`}
                        />
                        <p className="block max-w-xs truncate text-sm text-secondary-foreground">
                          {item.color}
                        </p>
                      </div>
                    </td>
                  )
                }

                return (
                  <td key={String(column.field)} className="p-4 py-5">
                    <p className="block max-w-xs truncate text-sm text-secondary-foreground">
                      {String(item[column.field])}
                    </p>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
