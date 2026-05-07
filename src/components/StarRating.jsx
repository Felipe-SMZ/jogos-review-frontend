export function StarDisplay({ nota = 0, size = '1rem' }) {
  // Visual: 5 stars with proportional fill (nota is 0-10)
  const percent = Math.max(0, Math.min(100, (Number(nota) / 10) * 100))
  const containerStyle = {
    position: 'relative',
    display: 'inline-block',
    fontSize: size,
    lineHeight: 1,
    letterSpacing: '2px',
  }
  const stars = '★★★★★'
  const backStyle = { color: 'var(--border)' }
  const frontStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    width: `${percent}%`,
    color: 'var(--gold)',
  }

  return (
    <span className="stars" style={containerStyle} aria-label={`Nota ${nota}/10`}>
      <span style={backStyle}>{stars}</span>
      <span style={frontStyle}>{stars}</span>
    </span>
  )
}

export function StarPicker({ value = 0, onChange }) {
  const [hover, setHover] = useState(null)

  const display = hover ?? value
  const percent = (display || 0) / 10 * 100

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const val = Math.max(1, Math.min(10, Math.ceil(p * 10)))
    setHover(val)
  }

  const handleLeave = () => setHover(null)

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const val = Math.max(1, Math.min(10, Math.ceil(p * 10)))
    onChange(val)
  }

  const handleKey = (e) => {
    if (e.key === 'ArrowLeft') onChange(Math.max(1, (value || 1) - 1))
    if (e.key === 'ArrowRight') onChange(Math.min(10, (value || 0) + 1))
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <div
        role="slider"
        aria-label="Avaliar"
        tabIndex={0}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={handleClick}
        onKeyDown={handleKey}
        style={{ position: 'relative', cursor: 'pointer', fontSize: '1.4rem', userSelect: 'none', width: '110px' }}
      >
        <span style={{ color: 'var(--border)', display: 'block' }}>★★★★★</span>
        <span style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', whiteSpace: 'nowrap', width: `${percent}%`, color: 'var(--gold)' }}>★★★★★</span>
      </div>
      <span style={{ marginLeft: '6px', color: 'var(--neon)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem' }}>
        {value || '—'}/10
      </span>
    </div>
  )
}
