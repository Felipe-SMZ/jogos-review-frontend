import { useState, useEffect, useCallback } from 'react'
import { listarJogos, deletarJogo, mediaNotas } from '../services/jogosService'
import { GENEROS, PLATAFORMAS, GENERO_LABEL, PLATAFORMA_LABEL } from '../constants/enums'
import { useAuth } from '../context/AuthContext'
import JogoCard from '../components/JogoCard'
import JogoForm from '../components/JogoForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import { SkeletonGrid } from '../components/Loading'
import { Alert } from "../components/Alert"
import { extractErrorMsg } from '../utils/errorUtils'


const PAGE_SIZE = 9

export default function Home() {
  const { isAdmin } = useAuth()

  const [jogos, setJogos] = useState([])
  const [medias, setMedias] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [filtroGenero, setFiltroGenero] = useState('')
  const [filtroPlataforma, setFiltroPlataforma] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editJogo, setEditJogo] = useState(null)
  const [deleteJogo, setDeleteJogo] = useState(null)

  const fetchJogos = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, size: PAGE_SIZE }
      if (filtroGenero) params.genero = filtroGenero
      if (filtroPlataforma) params.plataforma = filtroPlataforma

      const res = await listarJogos(params)
      const data = res.data
      const lista = data.content || data

      setJogos(lista)
      setTotalPages(data.totalPages || 1)
      setTotalElements(data.totalElements || lista.length)

      // Fetch medias in parallel
      const mediaMap = {}
      await Promise.allSettled(
        lista.map(async (j) => {
          try {
            const mr = await mediaNotas(j.id)
            const m = mr.data?.mediaNotas ?? mr.data?.media ?? mr.data?.average ?? mr.data?.mediaNota ?? null
            mediaMap[j.id] = m
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
    await deletarJogo(deleteJogo.id)
    setDeleteJogo(null)
    fetchJogos()
  }

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="animate-fade-up" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--neon)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              // Biblioteca de jogos
            </p>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--text)' }}>
              TODOS OS <span className="neon-text">JOGOS</span>
            </h1>
            {!loading && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {totalElements} {totalElements === 1 ? 'jogo encontrado' : 'jogos encontrados'}
              </p>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => { setEditJogo(null); setFormOpen(true) }}
              className="btn btn-primary animate-fade-up-delay-1"
            >
              + Novo Jogo
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="animate-fade-up-delay-1" style={{
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
        padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '2px', marginBottom: '1.5rem',
      }}>
        <select
          className="input"
          value={filtroGenero}
          onChange={handleFilterChange(setFiltroGenero)}
          style={{ flex: '1', minWidth: '180px' }}
        >
          <option value="">Todos os gêneros</option>
          {GENEROS.map(g => <option key={g} value={g}>{GENERO_LABEL[g]}</option>)}
        </select>

        <select
          className="input"
          value={filtroPlataforma}
          onChange={handleFilterChange(setFiltroPlataforma)}
          style={{ flex: '1', minWidth: '180px' }}
        >
          <option value="">Todas as plataformas</option>
          {PLATAFORMAS.map(p => <option key={p} value={p}>{PLATAFORMA_LABEL[p]}</option>)}
        </select>

        {(filtroGenero || filtroPlataforma) && (
          <button
            className="btn btn-ghost"
            onClick={() => { setFiltroGenero(''); setFiltroPlataforma(''); setPage(0) }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Error */}
      {error && <Alert type="error" message={error} style={{ marginBottom: '1rem' }} />}

      {/* Grid */}
      {loading ? (
        <SkeletonGrid count={PAGE_SIZE} />
      ) : jogos.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '300px', gap: '0.75rem',
          border: '1px dashed var(--border)', borderRadius: '2px',
        }}>
          <span style={{ fontSize: '2rem' }}>🎮</span>
          <p style={{ color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
            Nenhum jogo encontrado
          </p>
          {isAdmin && (
            <button onClick={() => { setEditJogo(null); setFormOpen(true) }} className="btn btn-outline" style={{ marginTop: '0.5rem' }}>
              Cadastrar primeiro jogo
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {jogos.map((jogo, i) => (
            <div key={jogo.id} className={`animate-fade-up`} style={{ animationDelay: `${i * 0.05}s` }}>
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

      {/* Admin modals */}
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
        message={`Tem certeza que quer deletar "${deleteJogo?.nome}"? Todas as reviews serão removidas.`}
      />
    </div>
  )
}
