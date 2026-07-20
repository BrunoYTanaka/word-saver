interface RowCheckboxCellProps {
  word: string
  checked: boolean
  onChange: () => void
}

export function RowCheckboxCell({
  word,
  checked,
  onChange
}: RowCheckboxCellProps) {
  return (
    <td className="border-b border-border px-2 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={word ? `Selecionar "${word}"` : 'Selecionar linha'}
        className="size-4 cursor-pointer accent-primary"
      />
    </td>
  )
}
