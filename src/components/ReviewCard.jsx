import { useState } from 'react'
import { StarPicker } from './StarRating'
import { Alert } from './Alert'
import { extractErrorMsg } from '../utils/errorUtils'
import { Spinner } from './Loading'
import { editarReview, deletarReview } from '../services/reviewsService'
import { useAuth } from '../context/AuthContext'

function getNomeDaReview(review) {
  return (
    review.nickname ||
    review.nomeUsuario ||
    review.usuario?.nome ||
    review.emailUsuario ||
    review.email ||
    review.usuario?.email ||
    review.autor ||
    null
  )
}

function getIniciais(identificador) {
  if (!identificador) return '?'
  if (identificador.includes('@')) {
    return identificador.substring(0, 2).toUpperCase()
  }
  const partes = identificador.trim().split(' ')
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase()
  return identificador.substring(0, 2).toUpperCase()
}

function getAvatarColor(str) {
  const colors = [
    { bg: 'rgba(0,255,136,0.12)', border: 'rgba(0,255,136,0.35)', text: '#00ff88' },
    { bg: 'rgba(0,180,255,0.12)', border: 'rgba(0,180,255,0.35)', text: '#00b4ff' },
    { bg: 'rgba(255,100,180,0.12)', border: 'rgba(255,100,180,0.35)', text: '#ff64b4' },
    { bg: 'rgba(255,200,0,0.12)', border: 'rgba(255,200,0,0.35)', text: '#ffc800' },
    { bg: 'rgba(180,100,255,0.12)', border: 'rgba(180,100,255,0.35)', text: '#b464ff' },
  ]
  let hash = 0
  for (let i = 0; i < (str || '').length; i++) hash += str.charCodeAt(i)
  return colors[hash % colors.length]
}

function NotaCirculo({ nota, size = 48 }) {
  const cor =
    nota >= 7.5 ? '#00ff88' :
      nota >= 5 ? '#ffc800' :
        '#ff3b5c'

  const corBg =
    nota >= 7.5 ? 'rgba(0,255,136,0.08)' :
      nota >= 5 ? 'rgba(255,200,0,0.08)' :
        'rgba(255,59,92,0.08)'

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1.5px solid ${cor}`,
      background: corBg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: size * 0.33 + 'px',
        fontWeight: 700, lineHeight: 1, color: cor,
      }}>
        {Number(nota).toFixed(1)}
      </span>
      <span style={{ fontSize: size * 0.18 + 'px', color: 'rgba(255,255,255,0.3)', lineHeight: 1 }}>
        /10
      </span>
    </div>
  )
}

export default function ReviewCard({ review, onUpdate, onDelete }) {
  const { user, isAdmin, isAuthenticated } = useAuth()

  const userId = user?.id ?? user?.usuario?.id ?? null
  const userEmail = user?.email ?? null
  const userNickname = user?.nickname ?? user?.nome ?? null
  const nomeExibido = getNomeDaReview(review)

  const isOwner = Boolean(
    isAuthenticated && (
      // comparar por id (quando token expõe id)
      (userId && (
        (review.usuario && String(review.usuario.id) === String(userId)) ||
        String(review.usuarioId || review.usuario_id || review.userId || review.user_id || review.autorId || review.autor_id || review.usuario?.id || review.user?.id || '') === String(userId)
      )) ||
      // comparar por e-mail (quando o token só expõe email)
      (userEmail && (
        (review.emailUsuario && review.emailUsuario === userEmail) ||
        (review.email && review.email === userEmail) ||
        (review.usuario && review.usuario.email && review.usuario.email === userEmail)
      )) ||
      // ou comparar por nickname/nome quando disponível
      (userNickname && review.nickname && userNickname === review.nickname)
    )
  )

  const canEdit = isOwner
  const canDelete = isOwner || (isAuthenticated && isAdmin)

  const [editing, setEditing] = useState(false)
  const [nota, setNota] = useState(review.nota)
  const [comentario, setComentario] = useState(review.comentario)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = async () => {
    if (!nota || nota < 1 || nota > 10) {
      setError('Nota deve ser entre 1 e 10.')
      return
    }
    if (!comentario.trim()) {
      setError('Comentário é obrigatório.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await editarReview(review.id, { nota, comentario })
      setEditing(false)
      onUpdate?.()
    } catch (err) {
      setError(extractErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deletarReview(review.id)
      onDelete?.()
    } catch (err) {
      setError(extractErrorMsg(err))
      setLoading(false)
    }
  }

  const iniciais = getIniciais(nomeExibido)
  const avatarCor = getAvatarColor(nomeExibido)

  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    : ''
  
  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(14,20,36,0.98), rgba(7,11,20,1))',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,0.2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: avatarCor.bg,
          border: `1.5px solid ${avatarCor.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.78rem', fontWeight: 700,
          color: avatarCor.text,
          userSelect: 'none',
        }}>
          {iniciais}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '200px',
            }}>
              {nomeExibido || 'Usuário'}
            </span>

            {isOwner && (
              <span style={{
                fontSize: '0.62rem',
                fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--neon)',
                opacity: 0.85,
                flexShrink: 0,
              }}>
                (você)
              </span>
            )}
          </div>

          {dateStr && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              {dateStr}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {!editing && <NotaCirculo nota={review.nota} size={48} />}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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
              rows={3}
              maxLength={500}
              style={{ resize: 'vertical', fontFamily: 'DM Sans, sans-serif' }}
            />
            <div style={{ textAlign: 'right', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '3px' }}>
              {comentario.length}/500
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => { setEditing(false); setError('') }} className="btn btn-ghost" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
              {loading ? <Spinner size={16} /> : 'Salvar'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ paddingLeft: '54px' }}>
          <p
            style={{
              color: 'rgba(232,234,240,0.82)',
              fontSize: '0.9rem',
              lineHeight: 1.75,
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}
          >
            {review.comentario}
          </p>

          {(canEdit || canDelete) && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                marginTop: '0.75rem',
              }}
            >
              {canEdit && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn btn-ghost"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.8rem',
                  }}
                >
                  Editar
                </button>
              )}

              {canDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="btn btn-danger"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.8rem',
                  }}
                >
                  Deletar
                </button>
              )}
            </div>
          )}
        </div>
      )
      }

      {confirmDelete && (
        <div style={{
          padding: '0.875rem 1rem',
          background: 'rgba(255,59,92,0.07)',
          border: '1px solid rgba(255,59,92,0.28)',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500 }}>
            Tem certeza que quer deletar esta review?
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setConfirmDelete(false)} className="btn btn-ghost" style={{ flex: 1, fontSize: '0.8rem' }}>
              Cancelar
            </button>
            <button onClick={handleDelete} disabled={loading} className="btn btn-danger" style={{ flex: 1, fontSize: '0.8rem' }}>
              {loading ? <Spinner size={14} /> : 'Sim, deletar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}