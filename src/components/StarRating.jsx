import { useMemo } from 'react'

function getNotaLabel(value) {
  if (!value) return 'Selecione'
  if (value >= 9) return 'Excelente'
  if (value >= 7) return 'Muito bom'
  if (value >= 5) return 'Bom'
  if (value >= 3) return 'Regular'
  return 'Fraco'
}

function getNotaTone(value) {
  if (!value) {
    return {
      badge: 'border-white/10 bg-white/[0.03] text-zinc-500',
      text: 'text-zinc-500',
    }
  }

  if (value >= 9) {
    return {
      badge: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-300',
      text: 'text-zinc-300',
    }
  }

  if (value >= 7) {
    return {
      badge: 'border-lime-400/25 bg-lime-400/10 text-lime-300',
      text: 'text-zinc-300',
    }
  }

  if (value >= 5) {
    return {
      badge: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
      text: 'text-zinc-300',
    }
  }

  if (value >= 3) {
    return {
      badge: 'border-orange-400/25 bg-orange-400/10 text-orange-300',
      text: 'text-zinc-300',
    }
  }

  return {
    badge: 'border-rose-400/25 bg-rose-400/10 text-rose-300',
    text: 'text-zinc-300',
  }
}

export function StarDisplay({ value = 0 }) {
  const nota = Number(value) || 0
  const label = getNotaLabel(nota)
  const tone = getNotaTone(nota)

  return (
    <div className="flex items-center gap-3">
      <div className={`rounded-xl border px-3 py-2 font-mono text-sm font-bold ${tone.badge}`}>
        {nota ? `${nota}/10` : '--'}
      </div>

      <span className={`text-sm ${tone.text}`}>{label}</span>
    </div>
  )
}

export function StarPicker({ value = 0, onChange }) {
  const label = useMemo(() => getNotaLabel(value), [value])
  const tone = useMemo(() => getNotaTone(value), [value])

  return (
    <div className="rounded-2xl border border-white/8 bg-[#171b25] p-4">
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 10 }).map((_, index) => {
          const nota = index + 1
          const active = nota === value

          return (
            <button
              key={nota}
              type="button"
              onClick={() => onChange?.(nota)}
              className={[
                'inline-flex h-11 items-center justify-center rounded-xl border font-mono text-sm font-bold transition',
                active
                  ? 'border-emerald-400/40 bg-emerald-400 text-black shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
                  : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:border-emerald-400/20 hover:bg-emerald-400/8 hover:text-emerald-300',
              ].join(' ')}
              aria-label={`Selecionar nota ${nota}`}
              title={`Nota ${nota}`}
            >
              {nota}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-black/10 px-3 py-3">
        <span className="text-sm text-zinc-500">Nota selecionada</span>

        <div className="flex items-center gap-3">
          <div className={`min-w-[66px] rounded-lg border px-3 py-1.5 text-center font-mono text-sm font-bold ${tone.badge}`}>
            {value ? `${value}/10` : '--'}
          </div>

          <span className={`text-sm ${tone.text}`}>
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}