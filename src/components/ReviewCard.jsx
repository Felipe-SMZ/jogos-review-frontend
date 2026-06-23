import { useState } from 'react'
import { StarPicker } from './StarRating'
import { Alert } from '../components/Alert'
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
  if (identificador.includes('@')) return identificador.substring(0, 2).toUpperCase()

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

function NotaBadge({ nota }) {
  const cor =
    nota >= 7.5 ? '#00ff88'
      : nota >= 5 ? '#ffc800'
        : '#ff3b5c'

  const corBg =
    nota >= 7.5 ? 'rgba(0,255,136,0.08)'
      : nota >= 5 ? 'rgba(255,200,0,0.08)'
        : 'rgba(255,59,92,0.08)'

  return (
    <div
      className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border"
      style={{
        borderColor: cor,
        background: corBg,
        boxShadow: `0 0 0 1px ${cor}20 inset`,
      }}
    >
      <span
        className="font-mono text-[1rem] font-bold leading-none"
        style={{ color: cor }}
      >
        {Number(nota).toFixed(1)}
      </span>
      <span className="mt-0.5 text-[10px] leading-none text-zinc-500">/10</span>
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
      (userId && (
        (review.usuario && String(review.usuario.id) === String(userId)) ||
        String(
          review.usuarioId ||
          review.usuario_id ||
          review.userId ||
          review.user_id ||
          review.autorId ||
          review.autor_id ||
          review.usuario?.id ||
          review.user?.id ||
          ''
        ) === String(userId)
      )) ||
      (userEmail && (
        (review.emailUsuario && review.emailUsuario === userEmail) ||
        (review.email && review.email === userEmail) ||
        (review.usuario && review.usuario.email && review.usuario.email === userEmail)
      )) ||
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
    <article className="rounded-[20px] border border-white/8 bg-[linear-gradient(145deg,rgba(14,20,36,0.98),rgba(7,11,20,1))] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition duration-300 hover:border-emerald-400/20 md:p-5">
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border font-mono text-[0.78rem] font-bold"
              style={{
                background: avatarCor.bg,
                borderColor: avatarCor.border,
                color: avatarCor.text,
              }}
            >
              {iniciais}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-semibold text-zinc-100 sm:text-[0.95rem]">
                  {nomeExibido || 'Usuário'}
                </span>

                {isOwner && (
                  <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-emerald-300">
                    Você
                  </span>
                )}
              </div>

              {dateStr && (
                <p className="mt-1 text-xs text-zinc-500">
                  {dateStr}
                </p>
              )}
            </div>
          </div>

          {!editing && (
            <div className="self-start sm:self-auto">
              <NotaBadge nota={review.nota} />
            </div>
          )}
        </header>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {editing ? (
          <div className="space-y-4 rounded-2xl border border-white/6 bg-white/[0.02] p-4">
            <div>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Sua nota
              </p>
              <StarPicker value={nota} onChange={setNota} />
            </div>

            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Comentário
              </p>

              <textarea
                className="w-full rounded-2xl border border-white/10 bg-[#171b25] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/60"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                maxLength={500}
                style={{ resize: 'vertical' }}
                placeholder="Atualize sua opinião sobre o jogo..."
              />

              <div className="mt-2 text-right text-[11px] text-zinc-500">
                {comentario.length}/500
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setEditing(false)
                  setError('')
                  setNota(review.nota)
                  setComentario(review.comentario)
                }}
                className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-zinc-300 transition hover:bg-white/[0.06]"
              >
                Cancelar
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-400 px-5 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? <Spinner size={16} /> : 'Salvar alterações'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300 sm:text-[0.95rem]">
                {review.comentario}
              </p>
            </div>

            {(canEdit || canDelete) && (
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                {canEdit && (
                  <button
                    onClick={() => setEditing(true)}
                    className="h-10 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-zinc-300 transition hover:bg-white/[0.06]"
                  >
                    Editar
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="h-10 rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 text-sm text-rose-300 transition hover:bg-rose-500/12"
                  >
                    Deletar
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {confirmDelete && (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/8 p-4">
            <p className="text-sm font-medium text-rose-300">
              Tem certeza que quer deletar esta review?
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="h-10 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-zinc-300 transition hover:bg-white/[0.06]"
              >
                Cancelar
              </button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? <Spinner size={14} /> : 'Sim, deletar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}