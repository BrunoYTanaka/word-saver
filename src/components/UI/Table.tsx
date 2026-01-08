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
  onEdit: (id: string) => void
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
      <div className="bg-surface flex w-full items-center justify-center rounded-lg border-border p-10 text-sm text-muted shadow-md">
        Nenhum dado disponível.
      </div>
    )
  }

  return (
    <div className="bg-surface relative flex w-full flex-col overflow-auto rounded-lg border-border shadow-md">
      <table className="w-full min-w-max table-auto border-collapse text-left">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.field)}
                className="border-b border-border p-4"
              >
                <p className="text-sm font-normal leading-none text-muted">
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
              className={`hover:bg-surface-muted transition-colors ${
                data.length - 1 > index ? 'border-b border-border' : ''
              }`}
            >
              {columns.map((column) => {
                if (column.field === 'actions') {
                  return (
                    <td key="actions" className="p-4 py-5">
                      <button
                        onClick={() => onEdit(item.id)}
                        title="Editar"
                        type="button"
                        className="hover:bg-primary-hover rounded-md p-1 text-primary transition-colors hover:text-primary-foreground"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        title="Remover"
                        type="button"
                        className="hover:bg-destructive-hover rounded-md p-1 text-destructive transition-colors hover:text-destructive-foreground"
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
                              ? 'bg-success text-success-foreground'
                              : item.alerts <= 2
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-destructive text-destructive-foreground'
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
                        <p className="max-w-xs truncate text-sm text-foreground">
                          {item.color}
                        </p>
                      </div>
                    </td>
                  )
                }

                return (
                  <td key={String(column.field)} className="p-4 py-5">
                    <p className="max-w-xs truncate text-sm text-foreground">
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
