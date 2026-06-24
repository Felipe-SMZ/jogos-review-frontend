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

const IGDB_PLATAFORMA_MAP = {
  'PlayStation': 'PLAYSTATION',
  'PlayStation 2': 'PLAYSTATION_2',
  'PlayStation 3': 'PLAYSTATION_3',
  'PlayStation 4': 'PLAYSTATION_4',
  'PlayStation 5': 'PLAYSTATION_5',
  'PlayStation Portable': 'PLAYSTATION_PORTABLE',
  'PlayStation Vita': 'PLAYSTATION_VITA',
  'Xbox': 'XBOX',
  'Xbox 360': 'XBOX_360',
  'Xbox One': 'XBOX_ONE',
  'Xbox Series X': 'XBOX_SERIES_X',
  'Xbox Series S': 'XBOX_SERIES_S',
  'Nintendo Entertainment System': 'NINTENDO_ENTERTAINMENT_SYSTEM',
  'Super Nintendo Entertainment System': 'SUPER_NINTENDO',
  'Nintendo 64': 'NINTENDO_64',
  'Nintendo GameCube': 'NINTENDO_GAMECUBE',
  Wii: 'NINTENDO_WII',
  'Wii U': 'NINTENDO_WII_U',
  'Nintendo Switch': 'NINTENDO_SWITCH',
  'Nintendo Switch 2': 'NINTENDO_SWITCH_2',
  'Game Boy': 'GAME_BOY',
  'Game Boy Advance': 'GAME_BOY_ADVANCE',
  'Nintendo DS': 'NINTENDO_DS',
  'Nintendo 3DS': 'NINTENDO_3DS',
  'PC (Microsoft Windows)': 'PC',
  PC: 'PC',
  Android: 'MOBILE',
  iOS: 'MOBILE',
}

function normalizePlataformas(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.filter(Boolean))]
  }

  if (typeof value === 'string' && value.trim()) {
    return [value]
  }

  return []
}

function getPlataformasIniciais(game) {
  const plataformasMapeadas =
    game?.platforms
      ?.map((platform) => IGDB_PLATAFORMA_MAP[platform?.name])
      .filter((item) => item && PLATAFORMAS.includes(item)) ?? []

  return normalizePlataformas(plataformasMapeadas)
}

export default function ImportarModal({ isOpen, onClose, game, onSuccess }) {
  const [genero, setGenero] = useState('')
  const [plataformas, setPlataformas] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setGenero('')
      setPlataformas(getPlataformasIniciais(game))
      setSubmitting(false)
      setError('')
    }
  }, [isOpen, game])

  const coverUrl = useMemo(() => {
    if (!game?.cover?.url) return null
    return getJogoImageUrl(game.cover.url.replace('t_thumb', 't_cover_big'))
  }, [game])

  const handlePlataformaToggle = (plataforma) => {
    setPlataformas((current) => {
      const selecionadas = normalizePlataformas(current)

      if (selecionadas.includes(plataforma)) {
        return selecionadas.filter((item) => item !== plataforma)
      }

      return [...selecionadas, plataforma]
    })
  }

  if (!isOpen || !game) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    const plataformasSelecionadas = normalizePlataformas(plataformas)

    if (!genero || !plataformasSelecionadas.length) {
      setError('Selecione gênero e pelo menos uma plataforma para confirmar a importação.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await importarJogoIgdb({
        igdbId: game.id,
        genero,
        plataformas: plataformasSelecionadas,
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
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] items-center justify-center">
        <div className="flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-[28px] border border-white/8 bg-[#0f1420] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
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

          <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-6">
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

            <div className="grid gap-5">
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
                  Plataformas
                </label>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {PLATAFORMAS.map((item) => {
                    const checked = plataformas.includes(item)

                    return (
                      <label
                        key={item}
                        className={`flex min-h-[48px] items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                          checked
                            ? 'border-emerald-400/40 bg-emerald-400/10 text-white'
                            : 'border-white/10 bg-[#171b25] text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handlePlataformaToggle(item)}
                          className="h-4 w-4 accent-emerald-400"
                        />
                        <span>{getPlataformaLabel(item)}</span>
                      </label>
                    )
                  })}
                </div>
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
    </div>
  )
}