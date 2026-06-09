import { Fragment } from 'react'
import { flexRender, type Row } from '@tanstack/react-table'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableRow } from './SortableRow'

interface TableBodyProps<TData extends { id: string; color?: string }> {
  rows: Row<TData>[]
  itemIds: string[]
  colCount: number
  emptyMessage?: string
  /** Column ids whose cell() already returns a full <td> */
  selfRenderedColumns?: string[]
  getRowColor?: (row: Row<TData>) => string | undefined
}

export function TableBody<TData extends { id: string; color?: string }>({
  rows,
  itemIds,
  colCount,
  emptyMessage = 'Nenhum registro encontrado.',
  selfRenderedColumns = [],
  getRowColor
}: TableBodyProps<TData>) {
  return (
    <tbody>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={colCount + 1}
              className="py-16 text-center text-sm text-muted-foreground"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <SortableRow
              key={row.original.id}
              id={row.original.id}
              rowColor={getRowColor ? getRowColor(row) : row.original.color}
            >
              {row.getVisibleCells().map((cell) => {
                if (selfRenderedColumns.includes(cell.column.id)) {
                  return (
                    <Fragment key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Fragment>
                  )
                }
                return (
                  <td
                    key={cell.id}
                    className="border-b border-border px-4 py-3"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )
              })}
            </SortableRow>
          ))
        )}
      </SortableContext>
    </tbody>
  )
}
