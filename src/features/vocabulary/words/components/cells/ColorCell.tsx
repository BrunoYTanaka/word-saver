import { useState, useRef, useEffect } from 'react'
import { cn } from '@/shared/utils/cn'

const PRESET_COLORS = [
  '#f87171', // red
  '#fb923c', // orange
  '#facc15', // yellow
  '#4ade80', // green
  '#34d399', // emerald
  '#38bdf8', // sky
  '#818cf8', // indigo
  '#c084fc', // purple
  '#f472b6', // pink
  '#94a3b8' // slate
]

interface ColorCellProps {
  value?: string
  onChange: (color: string | undefined) => void
}

export function ColorCell({ value, onChange }: ColorCellProps) {
  const [open, setOpen] = useState(false)
  const [customHex, setCustomHex] = useState(value ?? '')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <button
        type="button"
        title="Cor da linha"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'size-5 rounded-full border-2 border-border transition-transform hover:scale-110',
          !value && 'bg-surface-muted'
        )}
        style={value ? { backgroundColor: value } : {}}
      />

      {open && (
        <div className="absolute left-0 top-7 z-50 rounded-lg border border-border bg-surface p-3 shadow-lg">
          <div className="mb-2 grid grid-cols-5 gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => {
                  onChange(color)
                  setOpen(false)
                }}
                className={cn(
                  'size-6 rounded-full border-2 transition-transform hover:scale-110',
                  value === color ? 'border-foreground' : 'border-transparent'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-border pt-2">
            <input
              type="text"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              placeholder="#hex"
              maxLength={7}
              className="w-20 rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => {
                if (/^#[0-9a-fA-F]{6}$/.test(customHex)) {
                  onChange(customHex)
                  setOpen(false)
                }
              }}
              className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
            >
              OK
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange(undefined)
                  setCustomHex('')
                  setOpen(false)
                }}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
