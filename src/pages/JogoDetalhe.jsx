import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { buscarJogo, deletarJogo, mediaNotas } from '../services/jogosService'
import { listarReviews, criarReview } from '../services/reviewsService'
import { GENERO_LABEL, PLATAFORMA_LABEL } from '../constants/enums'
import { useAuth } from '../context/AuthContext'
import { StarDisplay, StarPicker } from '../components/StarRating'
import { Alert, extractErrorMsg } from '../components/Alert'
import { PageLoader, Spinner } from '../components/Loading'
import JogoForm from '../components/JogoForm'
import ConfirmDialog from '../components/ConfirmDialog'
import ReviewCard from '../components/ReviewCard'
import Pagination from '../components/Pagination'

export default function JogoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, user } = useAuth()

  const [jogo, setJogo] = useState(null)
  const [media, setMedia] = useState(null)
  const [loadingJogo, setLoadingJogo] = useState(true)
  const [error, setError] = useState('')

  const [reviews, setReviews] = useState([])
  const [reviewPage, setReviewPage] = useState(0)
  const [reviewTotalPages, setReviewTotalPages] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Nova review
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  const fetchJogo = useCallback(async () => {
    try {
      setLoadingJogo(true)
      setError('')

      const [jogoRes, mediaRes] = await Promise.all([
        buscarJogo(id),
        mediaNotas(id)
      ])

      setJogo(jogoRes.data)

      const mediaValue = mediaRes.data.notas

      setMedia(
        mediaValue !== null && mediaValue !== undefined
          ? Number(mediaValue)
          : null
      )

    } catch (err) {
      console.error(err)
      setError('Jogo não encontrado.')
    } finally {
      setLoadingJogo(false)
    }
  }, [id])

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true)

    try {
      const res = await listarReviews(id, {
        page: reviewPage,
        size: 5
      })

      const data = res.data

      setReviews(data.content || [])
      setReviewTotalPages(data.totalPages || 1)

    } catch (err) {
      console.error(err)
    } finally {
      setLoadingReviews(false)
    }
  }, [id, reviewPage])

  useEffect(() => {
    fetchJogo()
  }, [fetchJogo])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleDeleteJogo = async () => {
    await deletarJogo(id)
    navigate('/')
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!nota) {
      setReviewError('Selecione uma nota.')
      return
    }

    if (!comentario.trim()) {
      setReviewError('Escreva um comentário.')
      return
    }

    setSubmitting(true)
    setReviewError('')
    setReviewSuccess('')

    try {
      await criarReview(id, { nota, comentario })

      setNota(0)
      setComentario('')

      setReviewSuccess('Review publicada com sucesso!')

      await fetchReviews()
      await fetchJogo()

    } catch (err) {
      setReviewError(extractErrorMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  const userHasReview = reviews.some(
    r => r.emailUsuario === user?.email
  )

  if (loadingJogo) return <PageLoader />

  if (!jogo) {
    return (
      <div className="page-container">
        <Alert
          type="error"
          message={error || 'Jogo não encontrado.'}
        />

        <Link
          to="/"
          className="btn btn-ghost"
          style={{ marginTop: '1rem' }}
        >
          ← Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container">

      {/* Back */}
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          transition: 'color 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        ← Todos os jogos
      </Link>

      {/* Header */}
      <div
        className="animate-fade-up"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '2px',
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background:
              'linear-gradient(90deg, var(--neon), var(--accent), transparent)'
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              flex: 1
            }}
          >

            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}
            >
              <span className="badge badge-muted">
                {PLATAFORMA_LABEL[jogo.plataforma] || jogo.plataforma}
              </span>

              <span className="badge badge-neon">
                {GENERO_LABEL[jogo.genero] || jogo.genero}
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: 1
              }}
            >
              {jogo.nome}
            </h1>

            {media !== null && media !== undefined ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <StarDisplay nota={media} size="1.1rem" />

                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color: 'var(--neon)',
                    fontSize: '1.1rem',
                    fontWeight: 700
                  }}
                >
                  {Number(media).toFixed(1)}
                  <span
                    style={{
                      color: 'var(--text-dim)',
                      fontSize: '0.8rem'
                    }}
                  >
                    /10
                  </span>
                </span>
              </div>
            ) : (
              <span
                style={{
                  color: 'var(--text-dim)',
                  fontSize: '0.875rem'
                }}
              >
                Sem avaliações ainda
              </span>
            )}

          </div>

          {isAdmin && (
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexShrink: 0
              }}
            >
              <button
                onClick={() => setFormOpen(true)}
                className="btn btn-ghost"
              >
                Editar
              </button>

              <button
                onClick={() => setDeleteOpen(true)}
                className="btn btn-danger"
              >
                Deletar
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Conteúdo */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) 340px',
          gap: '1.5rem',
          alignItems: 'start'
        }}
      >

        {/* Reviews */}
        <div>

          <h2
            style={{
              fontSize: '1.8rem',
              marginBottom: '1rem',
              color: 'var(--text)'
            }}
          >
            REVIEWS{' '}
            <span
              style={{
                color: 'var(--text-dim)',
                fontSize: '1rem'
              }}
            >
              ({reviews.length})
            </span>
          </h2>

          {loadingReviews ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '2rem'
              }}
            >
              <Spinner size={24} label="Carregando reviews..." />
            </div>
          ) : reviews.length === 0 ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                border: '1px dashed var(--border)',
                borderRadius: '2px',
                color: 'var(--text-dim)',
                fontSize: '0.875rem',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              Nenhuma review ainda. Seja o primeiro!
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              {reviews.map(r => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  onUpdate={fetchReviews}
                  onDelete={() => {
                    fetchReviews()
                    fetchJogo()
                  }}
                />
              ))}
            </div>
          )}

          <Pagination
            page={reviewPage}
            totalPages={reviewTotalPages}
            onPageChange={setReviewPage}
          />

        </div>
      </div>

      {/* Modais */}
      <JogoForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        jogo={jogo}
        onSuccess={fetchJogo}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteJogo}
        title="Deletar Jogo"
        message={`Deletar "${jogo.nome}"? Todas as reviews também serão removidas.`}
      />
    </div>
  )
}