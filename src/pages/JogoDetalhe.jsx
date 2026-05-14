import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { buscarJogo, deletarJogo, mediaNotas } from '../services/jogosService'
import { listarReviews, criarReview } from '../services/reviewsService'
import { GENERO_LABEL, PLATAFORMA_LABEL } from '../constants/enums'
import { useAuth } from '../context/AuthContext'
import { StarPicker } from '../components/StarRating'
import { Alert } from './Alert'
import { extractErrorMsg } from '../utils/errorUtils'
import { PageLoader, Spinner } from '../components/Loading'
import JogoForm from '../components/JogoForm'
import ConfirmDialog from '../components/ConfirmDialog'
import ReviewCard from '../components/ReviewCard'
import Pagination from '../components/Pagination'

function MediaCirculo({ media }) {
  const cor =
    media >= 7.5 ? '#00ffaa' :
    media >= 5   ? '#ffc800' :
                   '#ff3b5c'
  const corBg =
    media >= 7.5 ? 'rgba(0,255,170,0.08)' :
    media >= 5   ? 'rgba(255,200,0,0.08)'  :
                   'rgba(255,59,92,0.08)'

  return (
    <div style={{
      width: 80, height: 80, borderRadius: '50%',
      border: `2px solid ${cor}`,
      background: corBg,
      boxShadow: `0 0 20px ${cor}22`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '1.4rem', fontWeight: 800,
        lineHeight: 1, color: cor,
      }}>
        {Number(media).toFixed(1)}
      </span>
      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1, marginTop: '2px' }}>
        /10
      </span>
    </div>
  )
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

      // A API retorna { jogoId, nome, mediaNotas } — cobre variações de campo
      const raw = mediaRes.data
      const valor = raw.mediaNotas ?? raw.notas ?? raw.media ?? null
      setMedia(valor !== null && valor !== undefined ? Number(valor) : null)
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
    if (!nota)              { setReviewError('Selecione uma nota.');   return }
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

  // Lógica robusta: não depende de um único nome de campo da API
  // e nunca dá true para visitantes anônimos (undefined === undefined)
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

  return (
    <div className="page-container">

      <Link
        to="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'var(--text-muted)', textDecoration: 'none',
          fontSize: '0.85rem', marginBottom: '1.5rem', transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        ← Todos os jogos
      </Link>

      {/* Header do jogo */}
      <div
        className="animate-fade-up"
        style={{
          background: 'linear-gradient(145deg, rgba(14,20,36,0.98), rgba(7,11,20,1))',
          border: '1px solid rgba(0,255,170,0.14)',
          borderRadius: '22px',
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(circle at top right, rgba(0,255,170,0.1), transparent 40%)',
        }} />

        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-muted">
                {PLATAFORMA_LABEL[jogo.plataforma] || jogo.plataforma}
              </span>
              <span className="badge badge-neon">
                {GENERO_LABEL[jogo.genero] || jogo.genero}
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '0.04em', lineHeight: 1, color: '#fff', margin: 0,
            }}>
              {jogo.nome}
            </h1>

            {media !== null && media !== undefined ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <MediaCirculo media={media} />
                <div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.1em', marginBottom: '2px',
                  }}>
                    MÉDIA DAS AVALIAÇÕES
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '2rem', fontWeight: 800, lineHeight: 1,
                    color: media >= 7.5 ? '#00ffaa' : media >= 5 ? '#ffc800' : '#ff3b5c',
                  }}>
                    {Number(media).toFixed(1)}
                    <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>
                      /10
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                Sem avaliações ainda
              </span>
            )}
          </div>

          {/* Botões admin — só aparecem com ROLE_ADMIN */}
          {isAdmin && (
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button onClick={() => setFormOpen(true)} className="btn btn-ghost">Editar</button>
              <button onClick={() => setDeleteOpen(true)} className="btn btn-danger">Deletar</button>
            </div>
          )}
        </div>
      </div>

      {/* Grid reviews + sidebar */}
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
            fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--text)',
          }}>
            REVIEWS{' '}
            <span style={{ color: 'var(--text-dim)', fontSize: '1rem', fontFamily: 'DM Sans, sans-serif' }}>
              ({reviews.length})
            </span>
          </h2>

          {loadingReviews ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Spinner size={24} label="Carregando reviews..." />
            </div>
          ) : reviews.length === 0 ? (
            <div style={{
              padding: '2rem', textAlign: 'center',
              border: '1px dashed var(--border)', borderRadius: '16px',
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

          <Pagination page={reviewPage} totalPages={reviewTotalPages} onPageChange={setReviewPage} />
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: '80px' }}>
          {isAuthenticated ? (
            userHasReview ? (
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(145deg, rgba(14,20,36,0.98), rgba(7,11,20,1))',
                border: '1px solid rgba(0,255,136,0.15)',
                borderRadius: '16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
                <p style={{ color: 'var(--neon)', fontSize: '0.875rem', fontWeight: 600 }}>
                  Você já avaliou este jogo
                </p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                  Para alterar, edite sua review na lista.
                </p>
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(145deg, rgba(14,20,36,0.98), rgba(7,11,20,1))',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px', overflow: 'hidden',
              }}>
                <div style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(0,255,136,0.04)',
                }}>
                  <h3 style={{
                    fontFamily: 'Bebas Neue, sans-serif',
                    fontSize: '1.1rem', letterSpacing: '0.06em', color: 'var(--text)',
                  }}>
                    ESCREVER REVIEW
                  </h3>
                </div>

                <form onSubmit={handleSubmitReview} style={{
                  padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                }}>
                  {reviewError   && <Alert type="error"   message={reviewError}   onClose={() => setReviewError('')} />}
                  {reviewSuccess && <Alert type="success" message={reviewSuccess} onClose={() => setReviewSuccess('')} />}

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                      SUA NOTA
                    </div>
                    <StarPicker value={nota} onChange={setNota} />
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>
                      COMENTÁRIO
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
                    <div style={{ textAlign: 'right', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '3px' }}>
                      {comentario.length}/500
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
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
              borderRadius: '16px', textAlign: 'center',
              display: 'flex', flexDirection: 'column', gap: '0.875rem',
            }}>
              <div style={{ fontSize: '2rem' }}>🎮</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Faça login para escrever uma review
              </p>
              <Link to="/login" className="btn btn-outline" style={{ justifyContent: 'center' }}>
                Entrar
              </Link>
              <Link
                to="/registro"
                style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
              >
                Não tem conta? Registre-se
              </Link>
            </div>
          )}
        </div>
      </div>

      <JogoForm isOpen={formOpen} onClose={() => setFormOpen(false)} jogo={jogo} onSuccess={fetchJogo} />
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteJogo}
        title="Deletar Jogo"
        message={`Deletar "${jogo.nome}"? Todas as reviews também serão removidas.`}
      />

      <style>{`
        @media (max-width: 768px) {
          .page-container > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          .page-container > div[style*="grid-template-columns"] > div:last-child {
            position: static !important;
          }
        }
      `}</style>
    </div>
  )
}