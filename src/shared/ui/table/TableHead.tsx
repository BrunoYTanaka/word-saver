import { flexRender, type HeaderGroup } from '@tanstack/react-table'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

interface TableHeadProps<TData> {
  headerGroups: HeaderGroup<TData>[]
  /** Column ids that render their own <th> (e.g. 'color', 'actions') */
  customColumns?: string[]
}

export function TableHead<TData>({
  headerGroups,
  customColumns = []
}: TableHeadProps<TData>) {
  return (
    <thead>
      {headerGroups.map((hg) => (
        <tr key={hg.id} className="border-b border-border">
          {/* drag handle placeholder */}
          <th style={{ width: '2rem', minWidth: '2rem' }} />
          {hg.headers.map((header) => {
            if (customColumns.includes(header.id)) {
              if (header.id === 'actions') {
                return (
                  <th
                    key={header.id}
                    className="sticky right-0 w-12 bg-surface px-2 py-3"
                  />
                )
              }
              return <th key={header.id} className="w-10 px-2 py-3" />
            }

            const col = header.column
            const sorted = col.getIsSorted()

            return (
              <th
                key={header.id}
                className="px-4 py-3"
                style={{ width: header.getSize() }}
              >
                {header.isPlaceholder ? null : col.getCanSort() ? (
                  <button
                    type="button"
                    onClick={col.getToggleSortingHandler()}
                    className="flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-foreground"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {sorted === 'asc' ? (
                      <ArrowUp className="size-3" />
                    ) : sorted === 'desc' ? (
                      <ArrowDown className="size-3" />
                    ) : (
                      <ArrowUpDown className="size-3 opacity-40" />
                    )}
                  </button>
                ) : (
                  <span className="text-sm font-normal text-muted-foreground">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </span>
                )}
              </th>
            )
          })}
        </tr>
      ))}
    </thead>
  )
}
