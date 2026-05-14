import { useState } from 'react'

export function StarDisplay({ nota, size = '1rem' }) {
  const full = Math.floor(nota)
  const half = nota % 1 >= 0.5
  const empty = 10 - full - (half ? 1 : 0)

  return (
    <span className="stars" style={{ fontSize: size, letterSpacing: '1px' }}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      <span style={{ color: 'var(--border)' }}>{'★'.repeat(empty)}</span>
    </span>
  )
}

export function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.4rem', padding: '2px',
            color: n <= (hovered || value) ? 'var(--gold)' : 'var(--border)',
            transition: 'color 0.1s, transform 0.1s',
            transform: hovered === n ? 'scale(1.2)' : 'scale(1)',
            lineHeight: 1,
          }}
          title={`Nota ${n}`}
        >
          ★
        </button>
      ))}
      <span style={{
        marginLeft: '8px', color: 'var(--neon)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.9rem', alignSelf: 'center',
      }}>
        {value || '—'}/10
      </span>
    </div>
  )
}