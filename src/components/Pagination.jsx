export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const range = 2
  for (let i = Math.max(0, page - range); i <= Math.min(totalPages - 1, page + range); i++) {
    pages.push(i)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '2rem' }}>
      <button
        onClick={() => onPageChange(0)}
        disabled={page === 0}
        className="btn btn-ghost"
        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
      >
        «
      </button>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="btn btn-ghost"
        style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}
      >
        ‹
      </button>

      {pages[0] > 0 && (
        <>
          <button onClick={() => onPageChange(0)} className="btn btn-ghost" style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}>1</button>
          {pages[0] > 1 && <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', minWidth: '36px' }}
        >
          {p + 1}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages - 1 && (
        <>
          {pages[pages.length - 1] < totalPages - 2 && <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>…</span>}
          <button onClick={() => onPageChange(totalPages - 1)} className="btn btn-ghost" style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}>{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        className="btn btn-ghost"
        style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}
      >
        ›
      </button>
      <button
        onClick={() => onPageChange(totalPages - 1)}
        disabled={page === totalPages - 1}
        className="btn btn-ghost"
        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
      >
        »
      </button>
    </div>
  )
}
