import { useState } from 'react'
import { StarDisplay, StarPicker } from './StarRating'
import { Alert, extractErrorMsg } from './Alert'
import { Spinner } from './Loading'
import { editarReview, deletarReview } from '../services/reviewsService'
import { useAuth } from '../context/AuthContext'

export default function ReviewCard({ review, onUpdate, onDelete }) {
  const { user, isAdmin } = useAuth()
  const isOwner = user?.email === review.emailUsuario
  const canEdit = isOwner
  const canDelete = isOwner || isAdmin

  const [editing, setEditing] = useState(false)
  const [nota, setNota] = useState(review.nota)
  const [comentario, setComentario] = useState(review.comentario)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = async () => {
    if (!nota || nota < 1 || nota > 10) { setError('Nota deve ser entre 1 e 10.'); return }
    if (!comentario.trim()) { setError('Comentário é obrigatório.'); return }
    setLoading(true); setError('')
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

  const dateStr = review.criadoEm
    ? new Date(review.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {review.nomeUsuario || review.nome || review.usuario?.nome || review.emailUsuario}
            {isAdmin && !isOwner && <span className="badge badge-accent" style={{ marginLeft: '6px' }}>admin view</span>}
          </span>
          {dateStr && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{dateStr}</span>
          )}
        </div>

        {!editing && (
          <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
            {canEdit && (
              <button onClick={() => setEditing(true)} className="btn btn-ghost" style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}>
                Editar
              </button>
            )}
            {canDelete && (
              <button onClick={() => setConfirmDelete(true)} disabled={loading} className="btn btn-danger" style={{ fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}>
                {loading ? <Spinner size={12} /> : 'Deletar'}
              </button>
            )}
          </div>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <StarPicker value={nota} onChange={setNota} />
          <textarea
            className="input"
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            rows={3}
            maxLength={500}
            style={{ resize: 'vertical', fontFamily: 'DM Sans, sans-serif' }}
          />
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
        <>
          <StarDisplay nota={review.nota} size="0.9rem" />
          <p style={{ color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {review.comentario}
          </p>
        </>
      )}

      {/* Confirm delete inline */}
      {confirmDelete && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: '2px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>Deletar esta review?</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setConfirmDelete(false)} className="btn btn-ghost" style={{ flex: 1, fontSize: '0.8rem' }}>Não</button>
            <button onClick={handleDelete} disabled={loading} className="btn btn-danger" style={{ flex: 1, fontSize: '0.8rem' }}>
              {loading ? <Spinner size={14} /> : 'Sim, deletar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
