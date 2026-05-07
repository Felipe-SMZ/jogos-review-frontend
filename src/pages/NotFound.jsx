import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: 'calc(100vh - 60px)',
      textAlign: 'center', gap: '1rem', padding: '2rem',
    }}>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
        ERROR_CODE: 404
      </p>
      <h1 className="neon-text" style={{ fontSize: 'clamp(5rem, 20vw, 10rem)', lineHeight: 1 }}>
        404
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>
        Essa página não existe ou foi removida.
      </p>
      <Link to="/" className="btn btn-outline" style={{ marginTop: '0.5rem' }}>
        ← Voltar para início
      </Link>
    </div>
  )
}
