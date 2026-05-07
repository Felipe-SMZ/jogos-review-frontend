export function Spinner({ size = 20, label = '' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div
        className="spinner"
        style={{ width: size, height: size }}
        role="status"
        aria-label={label || 'Carregando...'}
      />
      {label && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</span>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '400px', flexDirection: 'column', gap: '1rem',
    }}>
      <Spinner size={32} />
      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>
        CARREGANDO...
      </span>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="skeleton" style={{ height: '1.5rem', width: '70%' }} />
      <div className="skeleton" style={{ height: '1rem', width: '40%' }} />
      <div className="skeleton" style={{ height: '1rem', width: '55%' }} />
    </div>
  )
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  )
}
