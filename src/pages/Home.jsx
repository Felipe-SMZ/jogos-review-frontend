import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarJogos, deletarJogo, mediaNotas } from '../services/jogosService'
import { GENEROS, PLATAFORMAS } from '../constants/enums'
import { useAuth } from '../context/AuthContext'
import JogoCard from '../components/JogoCard'
import JogoForm from '../components/JogoForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import { SkeletonGrid } from '../components/Loading'
import { Alert } from '../components/Alert'
import { extractErrorMsg } from '../utils/errorUtils'
import {
  getGeneroLabel,
  getPlataformaLabel,
  getMediaReviewsNumber,
} from '../utils/jogoFormatters'

const PAGE_SIZE = 12

export default function Home() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

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
      setTotalElements(data.totalElements ?? lista.length)

      const mediaMap = {}

      await Promise.allSettled(
        lista.map(async (j) => {
          try {
            const mr = await mediaNotas(j.id)
            const raw = mr.data
            const m =
              raw?.mediaNotas ??
              raw?.media ??
              raw?.average ??
              raw?.mediaNota ??
              null

            mediaMap[j.id] = getMediaReviewsNumber(m)
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

  useEffect(() => {
    fetchJogos()
  }, [fetchJogos])

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value)
    setPage(0)
  }

  const handleDelete = async () => {
    try {
      if (deleteJogo?.id) {
        await deletarJogo(deleteJogo.id)
      }
    } finally {
      setDeleteJogo(null)
      fetchJogos()
    }
  }

  const temFiltro = Boolean(filtroGenero || filtroPlataforma)

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 pb-16 pt-8 md:px-10">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400">
            // Biblioteca de jogos
          </p>

          <h1 className="font-['Bebas_Neue'] text-[clamp(2.7rem,5vw,4.6rem)] leading-none tracking-[0.06em] text-white">
            TODOS OS <span className="text-emerald-400">JOGOS</span>
          </h1>

          {!loading && (
            <p className="mt-3 text-sm text-zinc-500">
              <span className="font-semibold text-zinc-200">{totalElements}</span>{' '}
              jogo{totalElements !== 1 ? 's' : ''} encontrado{totalElements !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/admin/importar')}
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06]"
            >
              ↓ Importar IGDB
            </button>

            <button
              onClick={() => {
                setEditJogo(null)
                setFormOpen(true)
              }}
              className="h-12 rounded-2xl bg-emerald-400 px-5 text-sm font-bold text-black transition hover:brightness-110"
            >
              + Novo Jogo
            </button>
          </div>
        )}
      </div>

      <div className="mb-8 rounded-3xl border border-white/6 bg-white/[0.02] p-4 backdrop-blur-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px] xl:items-end">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Gênero
              </label>
              <select
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#171b25] px-4 text-sm text-white outline-none transition focus:border-emerald-400/70"
                value={filtroGenero}
                onChange={handleFilterChange(setFiltroGenero)}
              >
                <option value="">Todos os gêneros</option>
                {GENEROS.map((g) => (
                  <option key={g} value={g}>
                    {getGeneroLabel(g)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Plataforma
              </label>
              <select
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#171b25] px-4 text-sm text-white outline-none transition focus:border-emerald-400/70"
                value={filtroPlataforma}
                onChange={handleFilterChange(setFiltroPlataforma)}
              >
                <option value="">Todas as plataformas</option>
                {PLATAFORMAS.map((p) => (
                  <option key={p} value={p}>
                    {getPlataformaLabel(p)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex h-12 items-center justify-between rounded-2xl border border-white/6 bg-black/20 px-4 text-sm text-zinc-500">
            {temFiltro ? (
              <>
                <span>{totalElements} resultado(s) filtrados</span>
                <button
                  onClick={() => {
                    setFiltroGenero('')
                    setFiltroPlataforma('')
                    setPage(0)
                  }}
                  className="text-emerald-300 transition hover:text-emerald-200"
                >
                  Limpar
                </button>
              </>
            ) : (
              <span>Explorando catálogo completo</span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          style={{ marginBottom: '1rem' }}
        />
      )}

      {loading ? (
        <SkeletonGrid count={PAGE_SIZE} />
      ) : jogos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/8 bg-white/[0.02] px-6 py-16 text-center">
          <div className="mx-auto max-w-md">
            <p className="font-['Bebas_Neue'] text-3xl tracking-[0.06em] text-zinc-200">
              {temFiltro ? 'NENHUM JOGO ENCONTRADO' : 'CATÁLOGO VAZIO'}
            </p>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {temFiltro
                ? 'Tente alterar os filtros para encontrar outros títulos.'
                : 'Comece criando um jogo manualmente ou importando da IGDB.'}
            </p>

            {isAdmin && !temFiltro && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate('/admin/importar')}
                  className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm text-zinc-300 transition hover:bg-white/[0.06]"
                >
                  Importar da IGDB
                </button>

                <button
                  onClick={() => {
                    setEditJogo(null)
                    setFormOpen(true)
                  }}
                  className="h-12 rounded-2xl bg-emerald-400 px-5 text-sm font-bold text-black transition hover:brightness-110"
                >
                  Criar primeiro jogo
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {jogos.map((jogo, i) => (
            <div
              key={jogo.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <JogoCard
                jogo={jogo}
                media={medias[jogo.id]}
                onEdit={(j) => {
                  setEditJogo(j)
                  setFormOpen(true)
                }}
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