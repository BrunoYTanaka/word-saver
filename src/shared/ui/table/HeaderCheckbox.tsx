import { useEffect, useRef } from 'react'

interface HeaderCheckboxProps {
  checked: boolean
  indeterminate: boolean
  onChange: () => void
  label: string
}

export function HeaderCheckbox({
  checked,
  indeterminate,
  onChange,
  label
}: HeaderCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={label}
      className="size-4 cursor-pointer accent-primary"
    />
  )
}
