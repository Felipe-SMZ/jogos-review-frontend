import { useState, useEffect } from 'react'
import Modal from './Modal'
import { Alert } from './Alert'
import { Spinner } from './Loading'
import { importarJogoIgdb } from '../services/igdbService'
import { GENEROS, PLATAFORMAS, GENERO_LABEL, PLATAFORMA_LABEL } from '../constants/enums'
import { extractErrorMsg } from '../utils/errorUtils'

const ERROR_MSG = {
  400: 'Campos inválidos. Verifique gênero e plataforma.',
  404: 'Jogo não encontrado na IGDB.',
  409: 'Este jogo já existe no sistema.',
  502: 'Falha na comunicação com a IGDB. Tente novamente.',
}

export default function ImportarModal({ isOpen, onClose, game, onSuccess }) {
  const [genero, setGenero] = useState('')
  const [plataforma, setPlataforma] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setGenero('')
      setPlataforma('')
      setError('')
    }
  }, [isOpen, game])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!genero || !plataforma) {
      setError('Selecione o gênero e a plataforma.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await importarJogoIgdb({ igdbId: game.id, genero, plataforma })
      onSuccess?.(`"${game.name}" importado com sucesso!`)
      onClose()
    } catch (err) {
      const status = err.response?.status
      setError(ERROR_MSG[status] ?? extractErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  if (!game) return null

  const coverUrl = game.cover?.url
    ? game.cover.url.replace('t_thumb', 't_cover_big')
    : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Jogo">
      {/* Preview do jogo */}
      <div style={{
        display: 'flex', gap: '1rem', alignItems: 'flex-start',
        padding: '0.75rem', background: 'var(--surface-2)',
        borderRadius: '8px', marginBottom: '1.25rem',
        border: '1px solid var(--border)',
      }}>
        {coverUrl && (
          <img
            src={coverUrl}
            alt={game.name}
            width={56}
            height={80}
            style={{ borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
          />
        )}
        <div>
          <p style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '1.1rem', letterSpacing: '0.04em', color: 'var(--text)',
            lineHeight: 1.1, marginBottom: '0.3rem',
          }}>
            {game.name}
          </p>
          {game.rating && (
            <span className="badge badge-neon" style={{ fontSize: '0.65rem' }}>
              Score IGDB: {Math.round(game.rating)}
            </span>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} style={{ marginBottom: '1rem' }} />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
            GÊNERO
          </label>
          <select
            className="input"
            value={genero}
            onChange={e => setGenero(e.target.value)}
            required
          >
            <option value="">Selecione o gênero</option>
            {GENEROS.map(g => (
              <option key={g} value={g}>{GENERO_LABEL[g]}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
            PLATAFORMA
          </label>
          <select
            className="input"
            value={plataforma}
            onChange={e => setPlataforma(e.target.value)}
            required
          >
            <option value="">Selecione a plataforma</option>
            {PLATAFORMAS.map(p => (
              <option key={p} value={p}>{PLATAFORMA_LABEL[p]}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !genero || !plataforma}
            style={{ flex: 2, justifyContent: 'center' }}
          >
            {loading ? <Spinner /> : 'Confirmar Importação'}
          </button>
        </div>
      </form>
    </Modal>
  )
}