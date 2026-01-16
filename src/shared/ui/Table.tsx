import { Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'

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
  itemsPerPage?: number
  searchable?: boolean
  searchFields?: Array<keyof T>
}

function Table<T extends object>({
  data,
  columns,
  onEdit,
  onDelete,
  itemsPerPage = 10,
  searchable = true,
  searchFields
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm.trim()) return data

    return data.filter((item) => {
      const fieldsToSearch =
        searchFields ||
        (Object.keys(item).filter(
          (key) =>
            key !== 'id' && typeof item[key as keyof typeof item] === 'string'
        ) as Array<keyof T>)

      return fieldsToSearch.some((field) => {
        const value = item[field]
        return (
          value &&
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    })
  }, [data, searchTerm, searchable, searchFields])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  useMemo(() => {
    setCurrentPage(1)
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (filteredData.length === 0 && !searchTerm) {
    return (
      <div className="flex w-full items-center justify-center rounded-lg border-border bg-surface p-10 text-sm text-muted-foreground shadow-md">
        Nenhum dado disponível.
      </div>
    )
  }

  if (filteredData.length === 0 && searchTerm) {
    return (
      <div className="w-full">
        {searchable && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-surface p-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        )}
        <div className="flex w-full items-center justify-center rounded-lg border-border bg-surface p-10 text-sm text-muted-foreground shadow-md">
          Nenhum resultado encontrado para &quot;{searchTerm}&quot;.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {searchable && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-surface p-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}

      <div className="relative flex w-full flex-col overflow-auto rounded-lg border-border bg-surface shadow-md">
        <table className="w-full min-w-max table-auto border-collapse text-left">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.field)}
                  className="border-b border-border p-4"
                >
                  <p className="text-sm font-normal leading-none text-muted-foreground">
                    {column.title}
                  </p>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={item.id}
                className={`transition-colors hover:bg-surface-muted ${
                  paginatedData.length - 1 > index
                    ? 'border-b border-border'
                    : ''
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
                          className="rounded-md p-1 text-primary transition-colors hover:bg-primary-hover hover:text-primary-foreground"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          title="Remover"
                          type="button"
                          className="rounded-md p-1 text-destructive transition-colors hover:bg-destructive-hover hover:text-destructive-foreground"
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

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              Mostrando {startIndex + 1} a{' '}
              {Math.min(endIndex, filteredData.length)} de {filteredData.length}{' '}
              resultados
            </span>
            {searchTerm && (
              <span className="text-xs">(filtrado de {data.length} total)</span>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center justify-between gap-1 sm:gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs transition-colors hover:bg-surface-muted disabled:opacity-50 disabled:hover:bg-background sm:px-3 sm:text-sm"
              >
                <ChevronLeft className="size-3 sm:size-4" />
                <span className="hidden sm:inline">Anterior</span>
                <span className="sm:hidden">Ant</span>
              </button>

              <div className="flex items-center gap-1 overflow-x-auto">
                {Array.from(
                  {
                    length: Math.min(
                      totalPages <= 3 ? totalPages : 3,
                      totalPages
                    )
                  },
                  (_, i) => {
                    let pageNum: number
                    if (totalPages <= 3) {
                      pageNum = i + 1
                    } else if (currentPage <= 2) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 1) {
                      pageNum = totalPages - 2 + i
                    } else {
                      pageNum = currentPage - 1 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex size-7 items-center justify-center rounded-md border text-xs transition-colors sm:size-8 sm:text-sm ${
                          currentPage === pageNum
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:bg-surface-muted'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  }
                )}

                {/* Mostrar "..." e última página se necessário */}
                {totalPages > 3 && currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && (
                      <span className="px-1 text-xs text-muted-foreground sm:text-sm">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="flex size-7 items-center justify-center rounded-md border border-border bg-background text-xs transition-colors hover:bg-surface-muted sm:size-8 sm:text-sm"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs transition-colors hover:bg-surface-muted disabled:opacity-50 disabled:hover:bg-background sm:px-3 sm:text-sm"
              >
                <span className="hidden sm:inline">Próxima</span>
                <span className="sm:hidden">Prox</span>
                <ChevronRight className="size-3 sm:size-4" />
              </button>
            </div>

            {/* Informação de página atual em mobile */}
            <div className="text-center text-xs text-muted-foreground sm:hidden">
              Página {currentPage} de {totalPages}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Table
