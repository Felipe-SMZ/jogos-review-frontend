import { useEffect, useMemo, useState } from 'react'
import { importarJogoIgdb } from '../services/igdbService'
import { GENEROS, PLATAFORMAS } from '../constants/enums'
import {
  getGeneroLabel,
  getPlataformaLabel,
  getJogoImageUrl,
  getJogoSummary,
} from '../utils/jogoFormatters'
import { extractErrorMsg } from '../utils/errorUtils'
import { Alert } from './Alert'

export default function ImportarModal({ isOpen, onClose, game, onSuccess }) {
  const [genero, setGenero] = useState('')
  const [plataforma, setPlataforma] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setGenero('')
      setPlataforma('')
      setSubmitting(false)
      setError('')
    }
  }, [isOpen, game])

  const coverUrl = useMemo(() => {
    if (!game?.cover?.url) return null
    return getJogoImageUrl(game.cover.url.replace('t_thumb', 't_cover_big'))
  }, [game])

  if (!isOpen || !game) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!genero || !plataforma) {
      setError('Selecione gênero e plataforma para confirmar a importação.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await importarJogoIgdb({
        igdbId: game.id,
        genero,
        plataforma,
      })

      onSuccess?.(`"${res?.data?.nome || game.name}" foi importado com sucesso.`)
      onClose?.()
    } catch (err) {
      setError(extractErrorMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/8 bg-[#0f1420] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between border-b border-white/6 px-6 py-5">
          <h2 className="font-['Bebas_Neue'] text-3xl tracking-[0.06em] text-white">
            IMPORTAR JOGO
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {error && <Alert type="error" message={error} />}

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex gap-4">
              <div className="h-24 w-16 shrink-0 overflow-hidden rounded-xl border border-white/8 bg-[#171b25]">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={game.name}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                    SEM CAPA
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 font-['Bebas_Neue'] text-[1.8rem] leading-[0.95] tracking-[0.04em] text-white">
                  {game.name}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                  <span>
                    Score IGDB:{' '}
                    <strong className="text-zinc-200">
                      {game.rating ? Number(game.rating).toFixed(0) : 'Sem nota'}
                    </strong>
                  </span>
                </div>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">
                  {getJogoSummary(game.summary)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Gênero
              </label>
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#171b25] px-4 text-sm text-white outline-none transition focus:border-emerald-400/70"
              >
                <option value="" disabled>
                  Selecione o gênero
                </option>
                {GENEROS.map((item) => (
                  <option key={item} value={item}>
                    {getGeneroLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Plataforma
              </label>
              <select
                value={plataforma}
                onChange={(e) => setPlataforma(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#171b25] px-4 text-sm text-white outline-none transition focus:border-emerald-400/70"
              >
                <option value="" disabled>
                  Selecione a plataforma
                </option>
                {PLATAFORMAS.map((item) => (
                  <option key={item} value={item}>
                    {getPlataformaLabel(item)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm text-zinc-300 transition hover:bg-white/[0.06]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="h-12 rounded-2xl bg-emerald-400 px-5 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? 'Importando...' : 'Confirmar Importação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}