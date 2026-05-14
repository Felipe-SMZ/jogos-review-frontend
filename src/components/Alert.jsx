export function Alert({ type = 'error', message, onClose }) {
  if (!message) return null

  const styles = {
    error: { bg: 'var(--accent-dim)', border: 'var(--accent)', color: 'var(--accent)', icon: '✕' },
    success: { bg: 'var(--neon-dim)', border: 'var(--neon)', color: 'var(--neon)', icon: '✓' },
    info: { bg: 'var(--surface-2)', border: 'var(--border)', color: 'var(--text-muted)', icon: 'ℹ' },
  }
  const s = styles[type] || styles.error

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      padding: '0.875rem 1rem',
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: '2px', color: s.color,
      fontSize: '0.875rem', lineHeight: 1.5,
    }}>
      <span style={{ fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>{s.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.color, lineHeight: 1, padding: '2px', opacity: 0.7 }}
        >
          ×
        </button>
      )}
    </div>
  )
}

