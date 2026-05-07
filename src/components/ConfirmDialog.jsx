import Modal from './Modal'
import { Spinner } from './Loading'
import { useState } from 'react'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirmar'} maxWidth="380px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          {message || 'Tem certeza que deseja realizar esta ação? Ela não pode ser desfeita.'}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onClose} disabled={loading} className="btn btn-ghost" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={loading} className="btn btn-danger" style={{ flex: 1 }}>
            {loading ? <Spinner size={16} /> : 'Confirmar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
