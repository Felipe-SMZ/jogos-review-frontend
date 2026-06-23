import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { buscarJogo, deletarJogo, mediaNotas } from '../services/jogosService'
import { listarReviews, criarReview } from '../services/reviewsService'
import { GENERO_LABEL, PLATAFORMA_LABEL } from '../constants/enums'
import { useAuth } from '../context/AuthContext'
import { StarPicker } from '../components/StarRating'
import { Alert } from '../components/Alert'
import { extractErrorMsg } from '../utils/errorUtils'
import { PageLoader, Spinner } from '../components/Loading'
import JogoForm from '../components/JogoForm'
import ConfirmDialog from '../components/ConfirmDialog'
import ReviewCard from '../components/ReviewCard'
import Pagination from '../components/Pagination'

function buildImage(url) {
  if (!url) return null
  return url.startsWith('http') ? url : `https:${url}`
}

function ratingColor(m) {
  if (m >= 7.5) return '#00ffaa'
  if (m >= 5)   return '#ffc800'
  return '#ff3b5c'
}

export default function JogoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, user } = useAuth()

  const [jogo, setJogo]               = useState(null)
  const [media, setMedia]             = useState(null)
  const [loadingJogo, setLoadingJogo] = useState(true)
  const [error, setError]             = useState('')

  const [reviews, setReviews]                   = useState([])
  const [reviewPage, setReviewPage]             = useState(0)
  const [reviewTotalPages, setReviewTotalPages] = useState(0)
  const [loadingReviews, setLoadingReviews]     = useState(false)

  const [formOpen, setFormOpen]     = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [nota, setNota]                   = useState(0)
  const [comentario, setComentario]       = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [reviewError, setReviewError]     = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  const fetchJogo = useCallback(async () => {
    setLoadingJogo(true)
    setError('')
    try {
      const [jogoRes, mediaRes] = await Promise.all([
        buscarJogo(id),
        mediaNotas(id),
      ])
      setJogo(jogoRes.data)
      const raw = mediaRes.data
      const valor = raw?.mediaNotas ?? raw?.notas ?? raw?.media ?? null
      const num = valor !== null && valor !== undefined ? Number(valor) : null
      setMedia(num && num > 0 ? num : null)
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
      const res = await listarReviews(id, { page: reviewPage, size: 5 })
      const data = res.data
      setReviews(data.content || [])
      setReviewTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingReviews(false)
    }
  }, [id, reviewPage])

  useEffect(() => { fetchJogo() },    [fetchJogo])
  useEffect(() => { fetchReviews() }, [fetchReviews])

  const handleDeleteJogo = async () => {
    await deletarJogo(id)
    navigate('/')
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!nota)              { setReviewError('Selecione uma nota.');    return }
    if (!comentario.trim()) { setReviewError('Escreva um comentário.'); return }
    setSubmitting(true); setReviewError(''); setReviewSuccess('')
    try {
      await criarReview(id, { nota, comentario })
      setNota(0); setComentario('')
      setReviewSuccess('Review publicada com sucesso!')
      await fetchReviews()
      await fetchJogo()
    } catch (err) {
      setReviewError(extractErrorMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  const userHasReview = Boolean(
    user?.email &&
    reviews.some(r => {
      const re = r.emailUsuario || r.email || r.usuario?.email || null
      return re && re === user.email
    })
  )

  if (loadingJogo) return <PageLoader />

  if (!jogo) return (
    <div className="page-container">
      <Alert type="error" message={error || 'Jogo não encontrado.'} />
      <Link to="/" className="btn btn-ghost" style={{ marginTop: '1rem' }}>← Voltar</Link>
    </div>
  )

  const coverUrl = buildImage(jogo.imageUrl)
  const cor      = media ? ratingColor(media) : null

  return (
    <div className="page-container">

      {/* Breadcrumb */}
      <Link
        to="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'var(--text-muted)', textDecoration: 'none',
          fontSize: '0.82rem', marginBottom: '1.5rem', transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        ← Todos os jogos
      </Link>

      {/* ── HERO ── */}
      <div
        className="animate-fade-up"
        style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '2rem',
          minHeight: '260px',
          isolation: 'isolate',
          boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* Camada 1 — background blur */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: '-20px',   // expande além das bordas para o blur não cortar
            backgroundImage: coverUrl ? `url(${coverUrl})` : 'none',
            backgroundColor: '#0c1220',
            backgroundSize: '300%',
            backgroundPosition: 'center top',
            filter: coverUrl ? 'blur(28px) brightness(0.22) saturate(1.6)' : 'none',
            zIndex: 0,
          }}
        />

        {/* Camada 2 — gradientes */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: coverUrl
              ? `linear-gradient(to right, rgba(7,11,20,0.96) 0%, rgba(7,11,20,0.7) 50%, rgba(7,11,20,0.15) 100%),
                 linear-gradient(to top,   rgba(7,11,20,0.85) 0%, transparent 55%)`
              : 'linear-gradient(145deg, rgba(14,20,36,0.98), rgba(7,11,20,1))',
            pointerEvents: 'none',
          }}
        />

        {/* Camada 3 — conteúdo */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'stretch',
          minHeight: '260px',
        }}>

          {/* Capa — altura total, bordas contidas pelo overflow:hidden do pai */}
          {coverUrl && (
            <div style={{
              flexShrink: 0,
              width: 185,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <img
                src={coverUrl}
                alt={jogo.nome}
                loading="eager"
                decoding="async"
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  display: 'block',
                }}
              />
              {/* Fade lateral → conteúdo */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, transparent 50%, rgba(7,11,20,0.96) 100%)',
                pointerEvents: 'none',
              }} />
            </div>
          )}

          {/* Info */}
          <div style={{
            padding: '1.75rem 2rem',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1, minWidth: 0, gap: '1rem',
          }}>

            {/* Linha superior: badges + ações admin */}
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className="badge badge-muted">
                  {PLATAFORMA_LABEL[jogo.plataforma] || jogo.plataforma}
                </span>
                <span className="badge badge-neon">
                  {GENERO_LABEL[jogo.genero] || jogo.genero}
                </span>
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => setFormOpen(true)}
                    className="btn btn-ghost"
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteOpen(true)}
                    className="btn btn-danger"
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}
                  >
                    Deletar
                  </button>
                </div>
              )}
            </div>

            {/* Título */}
            <h1 style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 'clamp(2rem, 4.5vw, 3.6rem)',
              letterSpacing: '0.04em', lineHeight: 1,
              color: '#fff', margin: 0,
              textShadow: '0 2px 20px rgba(0,0,0,0.8)',
            }}>
              {jogo.nome}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {media !== null ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '2.8rem', fontWeight: 800, lineHeight: 1,
                      color: cor,
                      textShadow: `0 0 32px ${cor}44`,
                    }}>
                      {Number(media).toFixed(1)}
                    </span>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.95rem', color: 'rgba(255,255,255,0.28)', fontWeight: 400,
                    }}>
                      /10
                    </span>
                  </div>

                  <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.1)' }} />

                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.62rem', color: 'rgba(255,255,255,0.32)',
                    letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.7,
                  }}>
                    Média das<br />avaliações
                  </span>
                </>
              ) : (
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  Sem avaliações ainda
                </span>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── GRID REVIEWS + SIDEBAR ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 340px',
        gap: '1.5rem',
        alignItems: 'start',
      }}>

        {/* Lista de reviews */}
        <div>
          <h2 style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text)',
          }}>
            REVIEWS{' '}
            <span style={{
              color: 'var(--text-dim)', fontSize: '0.95rem',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 400,
            }}>
              ({reviews.length})
            </span>
          </h2>

          {loadingReviews ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Spinner size={24} label="Carregando reviews..." />
            </div>
          ) : reviews.length === 0 ? (
            <div style={{
              padding: '2.5rem', textAlign: 'center',
              border: '1px dashed rgba(255,255,255,0.07)',
              borderRadius: '12px',
              color: 'var(--text-dim)', fontSize: '0.875rem',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              Nenhuma review ainda. Seja o primeiro!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reviews.map(r => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  onUpdate={fetchReviews}
                  onDelete={() => { fetchReviews(); fetchJogo() }}
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

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: '80px' }}>
          {isAuthenticated ? (
            userHasReview ? (
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(145deg, rgba(14,20,36,0.98), rgba(7,11,20,1))',
                border: '1px solid rgba(0,255,136,0.12)',
                borderRadius: '14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>✓</div>
                <p style={{ color: 'var(--neon)', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
                  Você já avaliou este jogo
                </p>
                <p style={{
                  color: 'var(--text-dim)', fontSize: '0.76rem',
                  marginTop: '0.375rem', margin: '0.375rem 0 0',
                }}>
                  Para alterar, edite sua review na lista.
                </p>
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(145deg, rgba(14,20,36,0.98), rgba(7,11,20,1))',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', overflow: 'hidden',
              }}>
                <div style={{
                  padding: '0.875rem 1.25rem',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(0,255,136,0.03)',
                }}>
                  <h3 style={{
                    fontFamily: 'Bebas Neue, sans-serif',
                    fontSize: '1.05rem', letterSpacing: '0.06em',
                    color: 'var(--text)', margin: 0,
                  }}>
                    ESCREVER REVIEW
                  </h3>
                </div>

                <form onSubmit={handleSubmitReview} style={{
                  padding: '1.25rem',
                  display: 'flex', flexDirection: 'column', gap: '1rem',
                }}>
                  {reviewError   && <Alert type="error"   message={reviewError}   onClose={() => setReviewError('')} />}
                  {reviewSuccess && <Alert type="success" message={reviewSuccess} onClose={() => setReviewSuccess('')} />}

                  <div>
                    <div style={{
                      fontSize: '0.68rem', color: 'var(--text-muted)',
                      fontFamily: 'JetBrains Mono, monospace',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      marginBottom: '0.5rem',
                    }}>
                      Sua Nota
                    </div>
                    <StarPicker value={nota} onChange={setNota} />
                  </div>

                  <div>
                    <div style={{
                      fontSize: '0.68rem', color: 'var(--text-muted)',
                      fontFamily: 'JetBrains Mono, monospace',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      marginBottom: '0.375rem',
                    }}>
                      Comentário
                    </div>
                    <textarea
                      className="input"
                      value={comentario}
                      onChange={e => setComentario(e.target.value)}
                      rows={4}
                      maxLength={500}
                      placeholder="Escreva sua opinião sobre o jogo..."
                      style={{ resize: 'vertical', fontFamily: 'DM Sans, sans-serif' }}
                    />
                    <div style={{
                      textAlign: 'right', fontSize: '0.66rem',
                      color: 'var(--text-dim)', marginTop: '3px',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {comentario.length}/500
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
                  >
                    {submitting ? <Spinner size={16} /> : 'Publicar Review'}
                  </button>
                </form>
              </div>
            )
          ) : (
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(145deg, rgba(14,20,36,0.98), rgba(7,11,20,1))',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', textAlign: 'center',
              display: 'flex', flexDirection: 'column', gap: '0.875rem',
            }}>
              <div style={{ fontSize: '2rem' }}>🎮</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                Faça login para escrever uma review
              </p>
              <Link to="/login" className="btn btn-outline" style={{ justifyContent: 'center' }}>
                Entrar
              </Link>
              <Link
                to="/registro"
                style={{
                  fontSize: '0.78rem', color: 'var(--text-dim)',
                  textDecoration: 'none', transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
              >
                Não tem conta? Registre-se
              </Link>
            </div>
          )}
        </div>
      </div>

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

      <style>{`
        @media (max-width: 768px) {
          .jogo-detalhe-grid {
            grid-template-columns: 1fr !important;
          }
          .jogo-detalhe-sidebar {
            position: static !important;
          }
          .jogo-hero-capa {
            width: 130px !important;
          }
        }
      `}</style>
    </div>
  )
}