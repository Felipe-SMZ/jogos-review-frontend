import { PLATAFORMA_LABEL } from '../constants/enums'
import {
  formatIgdbYear,
  getIgdbRatingColor,
  getJogoSummary,
  getJogoImageUrl,
} from '../utils/jogoFormatters'

const IGDB_PLATAFORMA_MAP = {
  'PlayStation 4': 'PS4',
  'PlayStation 5': 'PS5',
  'Xbox One': 'XBOX_ONE',
  'Xbox Series X': 'XBOX_SERIES_X',
  'Xbox Series S': 'XBOX_SERIES_S',
  'PC (Microsoft Windows)': 'PC',
  'Nintendo Switch': 'NINTENDO_SWITCH',
  Android: 'MOBILE',
  iOS: 'MOBILE',
}

function CoverFallback({ name }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,#1a2230,#10151e)]">
      <div className="px-4 text-center">
        <p className="font-['Bebas_Neue'] text-2xl tracking-[0.06em] text-zinc-500">
          SEM CAPA
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{name}</p>
      </div>
    </div>
  )
}

export default function IgdbGameCard({ game, onImportar }) {
  const rawCoverUrl = game.cover?.url
    ? game.cover.url.replace('t_thumb', 't_cover_big')
    : null

  const coverUrl = rawCoverUrl ? getJogoImageUrl(rawCoverUrl) : null
  const ano = formatIgdbYear(game.first_release_date)
  const ratingColor = getIgdbRatingColor(game.rating)
  const summary = getJogoSummary(game.summary)

  const plataformasLabels =
    game.platforms
      ?.map((p) => {
        const key = IGDB_PLATAFORMA_MAP[p.name]
        return key ? PLATAFORMA_LABEL[key] : p.name
      })
      .filter(Boolean)
      .slice(0, 3) ?? []

  return (
    <button
      type="button"
      onClick={() => onImportar(game)}
      className="group flex h-full min-h-[420px] w-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#121824] text-left shadow-[0_10px_30px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-[0_18px_50px_rgba(0,0,0,0.34)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={game.name}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.nextElementSibling
              if (fallback) fallback.style.display = 'flex'
            }}
            className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
          />
        ) : null}

        <div style={{ display: coverUrl ? 'none' : 'flex' }}>
          <CoverFallback name={game.name} />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0d121b] via-[#0d121b]/20 to-transparent" />

        {game.rating !== null && game.rating !== undefined && (
          <div
            className="absolute right-3 top-3 z-20 rounded-xl border bg-black/75 px-2.5 py-1 font-mono text-xs font-bold backdrop-blur-md"
            style={{ color: ratingColor, borderColor: `${ratingColor}88` }}
          >
            {Number(game.rating).toFixed(0)}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {plataformasLabels.length > 0 ? (
              plataformasLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-md border border-white/10 bg-black/35 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-zinc-300 backdrop-blur-sm"
                >
                  {label}
                </span>
              ))
            ) : (
              <span className="rounded-md border border-white/10 bg-black/35 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-zinc-500 backdrop-blur-sm">
                Plataforma não mapeada
              </span>
            )}
          </div>

          <h3 className="line-clamp-3 min-h-[3.6rem] font-['Bebas_Neue'] text-[1.15rem] leading-[0.95] tracking-[0.04em] text-white sm:text-[1.25rem] xl:text-[1.3rem]">
            {game.name}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
            {ano && <span>{ano}</span>}
            {ano && game.rating !== null && game.rating !== undefined && <span>•</span>}
            {game.rating !== null && game.rating !== undefined && (
              <span className="font-medium" style={{ color: ratingColor }}>
                IGDB {Number(game.rating).toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <p className="line-clamp-4 text-sm leading-6 text-zinc-400">
          {summary}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <span className="max-w-[88px] text-[10px] uppercase leading-4 tracking-[0.18em] text-zinc-500 sm:max-w-none sm:text-xs">
            Clique para importar
          </span>

          <span className="inline-flex h-10 min-w-[110px] items-center justify-center rounded-xl bg-emerald-400 px-4 text-sm font-bold tracking-[0.04em] text-black transition group-hover:brightness-110">
            Importar
          </span>
        </div>
      </div>
    </button>
  )
}