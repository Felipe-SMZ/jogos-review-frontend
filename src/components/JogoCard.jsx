import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getGeneroLabel,
  getPlataformaLabel,
  getJogoImageUrl,
  getJogoRatingNumber,
  getMediaReviewsLabel,
  getCommunityRatingColor,
} from '../utils/jogoFormatters'

function CardImageFallback({ nome }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,#18202b,#0f141c)]">
      <div className="px-4 text-center">
        <p className="font-['Bebas_Neue'] text-2xl tracking-[0.06em] text-zinc-500">
          SEM CAPA
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{nome}</p>
      </div>
    </div>
  )
}

function getNotaQualitativa(label, media, jogoRating) {
  if (label === 'Comunidade' && media !== null && media !== undefined) {
    const value = Number(media)
    if (value >= 9) return 'Excelente'
    if (value >= 7) return 'Muito bom'
    if (value >= 5) return 'Bom'
    if (value >= 3) return 'Regular'
    return 'Fraco'
  }

  if (label === 'IGDB' && jogoRating !== null && jogoRating !== undefined) {
    const value = Number(jogoRating) / 10
    if (value >= 9) return 'Excelente'
    if (value >= 7) return 'Muito bom'
    if (value >= 5) return 'Bom'
    if (value >= 3) return 'Regular'
    return 'Fraco'
  }

  return 'Sem nota'
}

export default function JogoCard({ jogo, media, onEdit, onDelete }) {
  const { isAdmin } = useAuth()

  const image = getJogoImageUrl(jogo.imageUrl)
  const jogoRating = getJogoRatingNumber(jogo.rating)
  const mediaLabel = getMediaReviewsLabel(media)
  const mediaColor = getCommunityRatingColor(media)

  const notaPrincipal =
    media !== null && media !== undefined
      ? { label: 'Comunidade', value: mediaLabel, color: mediaColor }
      : jogoRating !== null
        ? { label: 'IGDB', value: jogoRating.toFixed(0), color: '#22c55e' }
        : { label: 'Sem nota', value: '—', color: '#8b93a7' }

  const origem = jogoRating !== null ? 'Importado da base' : 'Registro manual'
  const notaQualitativa = getNotaQualitativa(notaPrincipal.label, media, jogoRating)

  return (
    <article className="group flex h-full min-h-[455px] flex-col overflow-hidden rounded-[26px] border border-white/8 bg-[#111722] shadow-[0_12px_34px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-emerald-400/20 hover:shadow-[0_18px_50px_rgba(0,0,0,0.34)]">
      <div className="relative h-[310px] overflow-hidden bg-[#151b25]">
        {image ? (
          <img
            src={image}
            alt={jogo.nome}
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

        <div style={{ display: image ? 'none' : 'flex' }}>
          <CardImageFallback nome={jogo.nome} />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f16] via-[#0b0f16]/18 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0b0f16] via-[#0b0f16]/82 to-transparent" />

        <div className="absolute right-4 top-4 z-20">
          <span
            className="inline-flex rounded-full border bg-[#18241d]/92 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] shadow-[0_8px_20px_rgba(0,0,0,0.22)] backdrop-blur-md"
            style={{
              color: notaPrincipal.color,
              borderColor:
                notaPrincipal.label === 'Sem nota'
                  ? 'rgba(255,255,255,0.08)'
                  : `${notaPrincipal.color}55`,
            }}
          >
            {notaPrincipal.label === 'IGDB' ? `IGDB ${notaPrincipal.value}` : notaPrincipal.value}
          </span>
        </div>

        {isAdmin && (
          <div className="absolute left-4 top-4 z-20 flex gap-2 opacity-0 transition duration-200 group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onEdit?.(jogo)
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/60 text-zinc-300 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
              title="Editar"
            >
              ✎
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onDelete?.(jogo)
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-500/20 bg-black/60 text-rose-400 backdrop-blur-md transition hover:bg-rose-500/10"
              title="Deletar"
            >
              ✕
            </button>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-md border border-white/10 bg-black/28 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-200 backdrop-blur-sm">
              {getPlataformaLabel(jogo.plataforma)}
            </span>

            <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300 backdrop-blur-sm">
              {getGeneroLabel(jogo.genero)}
            </span>
          </div>

          <h3 className="line-clamp-2 max-w-[85%] font-['Bebas_Neue'] text-[1.75rem] leading-[0.92] tracking-[0.03em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
            {jogo.nome}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <div className="grid grid-cols-2 gap-4 border-t border-white/6 pt-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              {notaPrincipal.label === 'Comunidade' ? 'Comunidade' : 'IGDB'}
            </p>

            <p
              className="mt-1 text-[2rem] font-black leading-none tracking-[-0.03em]"
              style={{ color: notaPrincipal.color }}
            >
              {notaPrincipal.value}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              {notaQualitativa}
            </p>
          </div>

          <div className="text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Origem
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {origem}
            </p>
          </div>
        </div>

        <Link
          to={`/jogos/${jogo.id}`}
          className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-emerald-400/18 bg-emerald-400/10 px-4 text-sm font-bold text-zinc-100 transition hover:border-emerald-400/30 hover:bg-emerald-400/14 hover:text-white"
        >
          Ver Reviews
        </Link>
      </div>
    </article>
  )
}