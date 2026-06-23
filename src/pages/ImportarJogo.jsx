import { useState } from 'react'
import { buscarJogosIgdb } from '../services/igdbService'
import { extractErrorMsg } from '../utils/errorUtils'
import IgdbGameCard from '../components/IgdbGameCard'
import ImportarModal from '../components/ImportarModal'
import { Alert } from '../components/Alert'

const SUGESTOES = ['God of War', 'Zelda', 'Hollow Knight', 'Red Dead', 'Elden Ring', 'Hades']

function SkeletonCover() {
  return (
    <div
      className="skeleton"
      style={{ aspectRatio: '2 / 3', borderRadius: '12px', width: '100%' }}
    />
  )
}

export default function ImportarJogo() {
  const [termo, setTermo]         = useState('')
  const [resultados, setResultados] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [buscou, setBuscou]       = useState(false)
  const [termoAtual, setTermoAtual] = useState('')
  const [modalGame, setModalGame] = useState(null)

  const executarBusca = async (t) => {
    if (!t.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')
    setBuscou(false)
    setTermoAtual(t.trim())
    try {
      const res = await buscarJogosIgdb(t.trim())
      setResultados(res.data)
      setBuscou(true)
    } catch (err) {
      setError(extractErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    executarBusca(termo)
  }

  const handleSugestao = (s) => {
    setTermo(s)
    executarBusca(s)
  }

  const handleSuccess = (msg) => {
    setSuccess(msg)
    if (modalGame) {
      setResultados(prev => prev.filter(g => g.id !== modalGame.id))
    }
  }

  return (
    <div className="page-container" style={{ paddingTop: '2rem' }}>

      {/* ── HEADER ── */}
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem',
          color: 'var(--neon)', letterSpacing: '0.15em',
          textTransform: 'uppercase', marginBottom: '0.2rem',
        }}>
          // Admin · IGDB
        </p>
        <h1 style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 'clamp(2rem, 4vw, 2.8rem)',
          letterSpacing: '0.06em', color: 'var(--text)',
          lineHeight: 1, margin: '0 0 0.35rem',
        }}>
          Importar Jogo{' '}
          <span style={{ color: 'var(--neon)' }}>via IGDB</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
          Busque jogos na base da IGDB e importe para o sistema com um clique.
        </p>
      </div>

      {/* ── SEARCH BAR ── */}
      <form
        onSubmit={handleBuscar}
        style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}
      >
        <input
          className="input"
          type="text"
          placeholder="Ex: God of War, Zelda, Hollow Knight..."
          value={termo}
          onChange={e => setTermo(e.target.value)}
          disabled={loading}
          autoFocus
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !termo.trim()}
          style={{ flexShrink: 0, minWidth: '90px' }}
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {/* ── FEEDBACK ── */}
      {error   && <Alert type="error"   message={error}   style={{ marginBottom: '1.5rem' }} />}
      {success && <Alert type="success" message={success} style={{ marginBottom: '1.5rem' }} />}

      {/* ── SKELETONS ── */}
      {loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1rem',
        }}>
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCover key={i} />)}
        </div>
      )}

      {/* ── RESULTADOS ── */}
      {!loading && buscou && resultados.length > 0 && (
        <>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem', color: 'var(--text-muted)',
            marginBottom: '1rem', letterSpacing: '0.04em',
          }}>
            {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} para{' '}
            <span style={{ color: 'var(--text)' }}>"{termoAtual}"</span>
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1rem',
          }}>
            {resultados.map(game => (
              <IgdbGameCard
                key={game.id}
                game={game}
                onImportar={setModalGame}
              />
            ))}
          </div>
        </>
      )}

      {/* ── SEM RESULTADOS ── */}
      {!loading && buscou && resultados.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          border: '1px dashed rgba(255,255,255,0.07)',
          borderRadius: '12px',
        }}>
          <p style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '1.5rem', letterSpacing: '0.06em',
            color: 'var(--text-dim)', marginBottom: '0.5rem',
          }}>
            Nenhum resultado
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Tente um termo diferente ou verifique a ortografia.
          </p>
        </div>
      )}

      {/* ── ESTADO INICIAL — sugestões ── */}
      {!loading && !buscou && (
        <div style={{ paddingTop: '1rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.68rem', color: 'var(--text-dim)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}>
            Sugestões de busca
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {SUGESTOES.map(s => (
              <button
                key={s}
                onClick={() => handleSugestao(s)}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.82rem', fontWeight: 500,
                  padding: '0.45rem 0.875rem', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,255,170,0.3)'
                  e.currentTarget.style.color = 'var(--neon)'
                  e.currentTarget.style.background = 'rgba(0,255,170,0.05)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = 'var(--text-muted)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL ── */}
      <ImportarModal
        isOpen={!!modalGame}
        onClose={() => setModalGame(null)}
        game={modalGame}
        onSuccess={handleSuccess}
      />
    </div>
  )
}