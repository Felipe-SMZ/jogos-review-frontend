import { useState, useEffect } from 'react'
import Modal from './Modal'
import { Alert } from '../components/Alert'
import { extractErrorMsg } from '../utils/errorUtils'
import { Spinner } from './Loading'
import { criarJogo, editarJogo } from '../services/jogosService'
import { GENEROS, PLATAFORMAS, GENERO_LABEL, PLATAFORMA_LABEL } from '../constants/enums'

export default function JogoForm({ isOpen, onClose, jogo, onSuccess }) {
  const isEditing = !!jogo

  const [form, setForm] = useState({ nome: '', genero: '', plataforma: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setForm(jogo ? { nome: jogo.nome, genero: jogo.genero, plataforma: jogo.plataforma } : { nome: '', genero: '', plataforma: '' })
      setError('')
    }
  }, [isOpen, jogo])

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nome.trim() || !form.genero || !form.plataforma) {
      setError('Preencha todos os campos.')
      return
    }
    setLoading(true)
    setError('')
    try {
      if (isEditing) {
        await editarJogo(jogo.id, form)
      } else {
        await criarJogo(form)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(extractErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Jogo' : 'Novo Jogo'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
            NOME DO JOGO
          </label>
          <input
            className="input"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Ex: The Last of Us Part II"
            maxLength={120}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
            GÊNERO
          </label>
          <select className="input" name="genero" value={form.genero} onChange={handleChange}>
            <option value="">Selecione o gênero...</option>
            {GENEROS.map(g => <option key={g} value={g}>{GENERO_LABEL[g]}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
            PLATAFORMA
          </label>
          <select className="input" name="plataforma" value={form.plataforma} onChange={handleChange}>
            <option value="">Selecione a plataforma...</option>
            {PLATAFORMAS.map(p => <option key={p} value={p}>{PLATAFORMA_LABEL[p]}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
            {loading ? <Spinner size={16} /> : (isEditing ? 'Salvar' : 'Criar Jogo')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
