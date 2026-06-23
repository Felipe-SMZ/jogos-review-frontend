import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarJogos, deletarJogo, mediaNotas } from '../services/jogosService'
import { GENEROS, PLATAFORMAS, GENERO_LABEL, PLATAFORMA_LABEL } from '../constants/enums'
import { useAuth } from '../context/AuthContext'
import JogoCard from '../components/JogoCard'
import JogoForm from '../components/JogoForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import { SkeletonGrid } from '../components/Loading'
import { Alert } from '../components/Alert'
import { extractErrorMsg } from '../utils/errorUtils'

const PAGE_SIZE = 12

export default function Home() {
  const { isAdmin } = useAuth()
  const navigate    = useNavigate()

  const [jogos, setJogos]                   = useState([])
  const [medias, setMedias]                 = useState({})
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState('')
  const [page, setPage]                     = useState(0)
  const [totalPages, setTotalPages]         = useState(0)
  const [totalElements, setTotalElements]   = useState(0)

  const [filtroGenero, setFiltroGenero]         = useState('')
  const [filtroPlataforma, setFiltroPlataforma] = useState('')

  const [formOpen, setFormOpen]   = useState(false)
  const [editJogo, setEditJogo]   = useState(null)
  const [deleteJogo, setDeleteJogo] = useState(null)

  const fetchJogos = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, size: PAGE_SIZE }
      if (filtroGenero)     params.genero     = filtroGenero
      if (filtroPlataforma) params.plataforma = filtroPlataforma

      const res   = await listarJogos(params)
      const data  = res.data
      const lista = data.content || data

      setJogos(lista)
      setTotalPages(data.totalPages || 1)
      setTotalElements(data.totalElements ?? lista.length)

      const mediaMap = {}
      await Promise.allSettled(
        lista.map(async (j) => {
          try {
            const mr  = await mediaNotas(j.id)
            const raw = mr.data
            const m   = raw?.mediaNotas ?? raw?.media ?? raw?.average ?? raw?.mediaNota ?? null
            const num = m !== null && m !== undefined ? Number(m) : null
            mediaMap[j.id] = num && num > 0 ? num : null
          } catch {
            mediaMap[j.id] = null
          }
        })
      )
      setMedias(mediaMap)
    } catch (err) {
      setError(extractErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }, [page, filtroGenero, filtroPlataforma])

  useEffect(() => { fetchJogos() }, [fetchJogos])

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value)
    setPage(0)
  }

  const handleDelete = async () => {
    try {
      await deletarJogo(deleteJogo.id)
    } finally {
      setDeleteJogo(null)
      fetchJogos()
    }
  }

  const temFiltro = filtroGenero || filtroPlataforma

  return (
    <div className="page-container">

      {/* ── HEADER ── */}
      <div className="animate-fade-up" style={{ marginBottom: '1.75rem' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem',
              color: 'var(--neon)', letterSpacing: '0.15em',
              textTransform: 'uppercase', marginBottom: '0.2rem',
            }}>
              // Biblioteca de jogos
            </p>
            <h1 style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
              color: 'var(--text)', lineHeight: 1, margin: 0,
            }}>
              TODOS OS <span style={{ color: 'var(--neon)' }}>JOGOS</span>
            </h1>
            {!loading && (
              <p style={{
                color: 'var(--text-dim)', fontSize: '0.78rem',
                marginTop: '0.3rem',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {totalElements} {totalElements === 1 ? 'jogo encontrado' : 'jogos encontrados'}
              </p>
            )}
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/admin/importar')}
                className="btn btn-ghost"
                style={{ fontSize: '0.82rem' }}
              >
                ⬇ Importar IGDB
              </button>
              <button
                onClick={() => { setEditJogo(null); setFormOpen(true) }}
                className="btn btn-primary"
                style={{ fontSize: '0.82rem' }}
              >
                + Novo Jogo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── FILTROS — inline e compactos ── */}
      <div
        className="animate-fade-up-delay-1"
        style={{
          display: 'flex', gap: '0.5rem',
          flexWrap: 'wrap', alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <select
          className="input"
          value={filtroGenero}
          onChange={handleFilterChange(setFiltroGenero)}
          style={{ width: 'auto', minWidth: '155px', flex: '0 1 auto' }}
        >
          <option value="">Todos os gêneros</option>
          {GENEROS.map(g => (
            <option key={g} value={g}>{GENERO_LABEL[g]}</option>
          ))}
        </select>

        <select
          className="input"
          value={filtroPlataforma}
          onChange={handleFilterChange(setFiltroPlataforma)}
          style={{ width: 'auto', minWidth: '155px', flex: '0 1 auto' }}
        >
          <option value="">Todas as plataformas</option>
          {PLATAFORMAS.map(p => (
            <option key={p} value={p}>{PLATAFORMA_LABEL[p]}</option>
          ))}
        </select>

        {temFiltro && (
          <button
            className="btn btn-ghost"
            onClick={() => { setFiltroGenero(''); setFiltroPlataforma(''); setPage(0) }}
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.7rem' }}
          >
            ✕ Limpar
          </button>
        )}

        {temFiltro && !loading && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem', color: 'var(--text-dim)',
          }}>
            {totalElements} resultado{totalElements !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── ERRO ── */}
      {error && (
        <Alert type="error" message={error} style={{ marginBottom: '1rem' }} />
      )}

      {/* ── GRID ── */}
      {loading ? (
        <SkeletonGrid count={PAGE_SIZE} />
      ) : jogos.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: '320px', gap: '0.75rem',
          border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: '12px',
        }}>
          <span style={{ fontSize: '2.5rem' }}>🎮</span>
          <p style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '1.3rem', letterSpacing: '0.06em',
            color: 'var(--text-dim)', margin: 0,
          }}>
            {temFiltro ? 'Nenhum jogo com esses filtros' : 'Nenhum jogo cadastrado ainda'}
          </p>
          {isAdmin && !temFiltro && (
            <button
              onClick={() => navigate('/admin/importar')}
              className="btn btn-ghost"
              style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}
            >
              ⬇ Importar da IGDB
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {jogos.map((jogo, i) => (
            <div
              key={jogo.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 0.035}s` }}
            >
              <JogoCard
                jogo={jogo}
                media={medias[jogo.id]}
                onEdit={(j) => { setEditJogo(j); setFormOpen(true) }}
                onDelete={setDeleteJogo}
              />
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <JogoForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        jogo={editJogo}
        onSuccess={fetchJogos}
      />

      <ConfirmDialog
        isOpen={!!deleteJogo}
        onClose={() => setDeleteJogo(null)}
        onConfirm={handleDelete}
        title="Deletar Jogo"
        message={`Deletar "${deleteJogo?.nome}"? Todas as reviews também serão removidas.`}
      />
    </div>
  )
}