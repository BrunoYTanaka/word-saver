import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalRows: number
  filteredRows: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  rowLabel?: string
}

export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalRows,
  filteredRows,
  onPageChange,
  onPageSizeChange,
  rowLabel = 'resultado'
}: TablePaginationProps) {
  const start = totalPages === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, filteredRows)

  const getPageNumbers = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 3) return [1, 2, 3, 4, 5]
    if (currentPage >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      ]
    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2
    ]
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          {filteredRows === 0
            ? `Nenhum ${rowLabel}`
            : `Mostrando ${start}–${end} de ${filteredRows}`}
          {filteredRows !== totalRows && ` (filtrado de ${totalRows})`}
        </span>
        <div className="flex items-center gap-1.5">
          <label htmlFor="table-page-size" className="text-xs">
            Itens:
          </label>
          <select
            id="table-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded border border-border bg-background px-1.5 py-0.5 text-xs text-foreground outline-none"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="flex size-7 items-center justify-center rounded border border-border bg-background text-sm transition-colors hover:bg-surface-muted disabled:opacity-40"
          >
            <ChevronsLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex size-7 items-center justify-center rounded border border-border bg-background text-sm transition-colors hover:bg-surface-muted disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          {getPageNumbers().map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`flex size-7 items-center justify-center rounded border text-xs transition-colors ${
                p === currentPage
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-surface-muted'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex size-7 items-center justify-center rounded border border-border bg-background text-sm transition-colors hover:bg-surface-muted disabled:opacity-40"
          >
            <ChevronRight className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="flex size-7 items-center justify-center rounded border border-border bg-background text-sm transition-colors hover:bg-surface-muted disabled:opacity-40"
          >
            <ChevronsRight className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
