import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { buscarJogoPorId, mediaNotas } from '../services/jogosService'
import { buscarReviewsPorJogo, criarReview } from '../services/reviewsService'
import { Alert } from '../components/Alert'
import ReviewCard from '../components/ReviewCard'
import ReviewFormCard from '../components/ReviewFormCard'
import { extractErrorMsg } from '../utils/errorUtils'
import {
  getGeneroLabel,
  getPlataformaLabel,
  getJogoImageUrl,
  getJogoSummary,
  getJogoRatingNumber,
  getCommunityRatingColor,
} from '../utils/jogoFormatters'

function getScoreLabel(value, scale = 10) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return 'Sem nota'
  }

  const normalized = scale === 100 ? Number(value) / 10 : Number(value)

  if (normalized >= 9) return 'Excelente'
  if (normalized >= 7) return 'Muito bom'
  if (normalized >= 5) return 'Bom'
  if (normalized >= 3) return 'Regular'
  return 'Fraco'
}

function formatMainScore(value, scale = 10) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return 'Sem nota'
  }

  const num = Number(value)

  if (scale === 100) {
    return `${Math.round(num)}`
  }

  const rounded = Math.round(num * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1)
}

function StatCard({ label, value, hint, color = '#e5e7eb' }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>

      <p
        className="mt-3 text-[1.9rem] font-black leading-none tracking-[-0.03em]"
        style={{ color }}
      >
        {value}
      </p>

      {hint && (
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {hint}
        </p>
      )}
    </div>
  )
}

function extrairNotaReview(review) {
  const valor = Number(
    review?.nota ??
    review?.rating ??
    review?.score ??
    review?.notaReview ??
    null
  )

  return Number.isFinite(valor) ? valor : null
}

function calcularMediaLocal(reviews) {
  const notas = reviews
    .map(extrairNotaReview)
    .filter((nota) => Number.isFinite(nota) && nota >= 1 && nota <= 10)

  if (!notas.length) return null

  const soma = notas.reduce((acc, nota) => acc + nota, 0)
  return soma / notas.length
}

function extrairMediaDaResposta(raw) {
  const candidatos = [
    raw?.mediaNotas,
    raw?.media,
    raw?.average,
    raw?.mediaNota,
    raw?.notaMedia,
    raw?.avg,
    raw?.value,
    typeof raw === 'number' ? raw : null,
  ]

  const encontrada = candidatos.find((item) => Number.isFinite(Number(item)))
  if (encontrada === undefined || encontrada === null) return null

  const numero = Number(encontrada)
  return Number.isFinite(numero) ? numero : null
}

export default function JogoDetalhe() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()

  const [jogo, setJogo] = useState(null)
  const [reviews, setReviews] = useState([])
  const [mediaApi, setMediaApi] = useState(null)

  const [loadingJogo, setLoadingJogo] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const carregarTudo = useCallback(async () => {
    setError('')
    setLoadingJogo(true)
    setLoadingReviews(true)

    try {
      const [jogoRes, reviewsRes, mediaRes] = await Promise.allSettled([
        buscarJogoPorId(id),
        buscarReviewsPorJogo(id),
        mediaNotas(id),
      ])

      if (jogoRes.status === 'fulfilled') {
        setJogo(jogoRes.value.data)
      } else {
        throw jogoRes.reason
      }

      let reviewsCarregadas = []

      if (reviewsRes.status === 'fulfilled') {
        const data = reviewsRes.value.data
        reviewsCarregadas = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
            ? data
            : []

        setReviews(reviewsCarregadas)
      } else {
        setReviews([])
      }

      if (mediaRes.status === 'fulfilled') {
        const mediaExtraida = extrairMediaDaResposta(mediaRes.value.data)
        setMediaApi(mediaExtraida)
      } else {
        setMediaApi(null)
      }

      if (mediaRes.status !== 'fulfilled') {
        setMediaApi(calcularMediaLocal(reviewsCarregadas))
      }
    } catch (err) {
      setError(extractErrorMsg(err))
    } finally {
      setLoadingJogo(false)
      setLoadingReviews(false)
    }
  }, [id])

  useEffect(() => {
    carregarTudo()
  }, [carregarTudo])

  const handleSubmitReview = async () => {
    const notaInt = Number(nota)
    const comentarioLimpo = comentario.trim()

    if (!isAuthenticated) {
      setError('Você precisa estar logado para publicar uma review.')
      return
    }

    if (!Number.isInteger(notaInt) || notaInt < 1 || notaInt > 10) {
      setError('A nota deve estar entre 1 e 10.')
      return
    }

    if (!comentarioLimpo) {
      setError('O comentário é obrigatório.')
      return
    }

    if (comentarioLimpo.length > 500) {
      setError('O comentário deve ter no máximo 500 caracteres.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await criarReview(id, {
        nota: notaInt,
        comentario: comentarioLimpo,
      })

      setNota(0)
      setComentario('')
      setSuccess('Review publicada com sucesso.')
      await carregarTudo()
    } catch (err) {
      setError(extractErrorMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  const imageUrl = useMemo(() => getJogoImageUrl(jogo?.imageUrl), [jogo])
  const resumo = useMemo(() => getJogoSummary(jogo?.summary), [jogo])

  const ratingIgdb = getJogoRatingNumber(jogo?.rating)

  const mediaCalculada = useMemo(() => {
    if (mediaApi !== null && Number.isFinite(mediaApi)) return mediaApi
    return calcularMediaLocal(reviews)
  }, [mediaApi, reviews])

  const mediaColor = mediaCalculada !== null
    ? getCommunityRatingColor(mediaCalculada)
    : '#e5e7eb'

  const igdbColor = ratingIgdb !== null ? '#7dd3fc' : '#e5e7eb'

  if (loadingJogo) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 lg:px-8 xl:px-10">
        <div className="space-y-6">
          <div className="h-6 w-40 animate-pulse rounded-lg bg-white/8" />
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="aspect-[3/4] animate-pulse rounded-[28px] bg-white/8" />
            <div className="min-h-[420px] animate-pulse rounded-[28px] bg-white/8" />
          </div>
        </div>
      </div>
    )
  }

  if (!jogo) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-8 text-center sm:px-6 lg:px-8 xl:px-10">
        <Alert type="error" message={error || 'Jogo não encontrado.'} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 lg:px-8 xl:px-10">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          ← Todos os jogos
        </Link>
      </div>

      {error && (
        <div className="mb-5">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {success && (
        <div className="mb-5">
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      <section className="overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(145deg,rgba(20,25,40,0.98),rgba(13,17,28,1))] shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
        <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="relative min-h-[340px] overflow-hidden bg-[#151b25]">
            <img
              src={imageUrl}
              alt={jogo.nome}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0f1420]/70 lg:hidden" />
            <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-transparent to-[#0f1420] lg:block" />
          </div>

          <div className="p-5 sm:p-7 lg:p-8 xl:p-10">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-300">
                  {getPlataformaLabel(jogo.plataforma)}
                </span>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300">
                  {getGeneroLabel(jogo.genero)}
                </span>
              </div>

              <div>
                <h1 className="font-['Bebas_Neue'] text-[clamp(2.5rem,6vw,5rem)] leading-[0.92] tracking-[0.05em] text-white">
                  {jogo.nome}
                </h1>

                <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-300 sm:text-[0.98rem]">
                  {resumo}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Nota da comunidade"
                  value={mediaCalculada !== null ? formatMainScore(mediaCalculada, 10) : 'Sem nota'}
                  hint={
                    mediaCalculada !== null
                      ? `${getScoreLabel(mediaCalculada, 10)} · baseada em ${reviews.length} review(s).`
                      : 'Ainda não há avaliações da comunidade.'
                  }
                  color={mediaColor}
                />

                <StatCard
                  label="Nota do IGDB"
                  value={ratingIgdb !== null ? formatMainScore(ratingIgdb, 100) : 'Sem nota'}
                  hint={
                    ratingIgdb !== null
                      ? `${getScoreLabel(ratingIgdb, 100)} · score importado da base externa.`
                      : 'Este jogo ainda não possui score externo.'
                  }
                  color={igdbColor}
                />

                <StatCard
                  label="Status das reviews"
                  value={reviews.length > 0 ? `${reviews.length}` : '0'}
                  hint={
                    reviews.length > 0
                      ? 'Quantidade de avaliações publicadas neste jogo.'
                      : 'Nenhuma review publicada até o momento.'
                  }
                />

                <StatCard
                  label="Origem dos dados"
                  value={ratingIgdb !== null ? 'IGDB' : 'Manual'}
                  hint={
                    ratingIgdb !== null
                      ? 'Dados enriquecidos com base externa.'
                      : 'Jogo cadastrado sem nota externa.'
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                Reviews
              </p>

              <h2 className="font-['Bebas_Neue'] text-[2.4rem] leading-none tracking-[0.04em] text-white">
                OPINIÕES DA COMUNIDADE
              </h2>
            </div>

            <p className="text-sm text-zinc-500">
              {reviews.length} item(ns) nesta página
            </p>
          </div>

          {loadingReviews ? (
            <div className="space-y-4">
              <div className="h-44 animate-pulse rounded-[20px] bg-white/8" />
              <div className="h-44 animate-pulse rounded-[20px] bg-white/8" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/8 bg-white/[0.02] px-6 py-16 text-center">
              <p className="font-['Bebas_Neue'] text-4xl tracking-[0.05em] text-zinc-200">
                AINDA NÃO HÁ REVIEWS
              </p>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                Seja o primeiro a registrar uma opinião e abrir a discussão sobre este jogo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onUpdate={carregarTudo}
                  onDelete={carregarTudo}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <ReviewFormCard
            disabled={!isAuthenticated}
            nota={nota}
            setNota={setNota}
            comentario={comentario}
            setComentario={setComentario}
            loading={submitting}
            onSubmit={handleSubmitReview}
          />

          {!isAuthenticated && (
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-sm leading-6 text-zinc-400">
              Você precisa estar logado para publicar uma review.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}