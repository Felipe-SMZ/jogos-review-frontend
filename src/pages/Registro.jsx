import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrar } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/authService'
import { Alert } from './Alert'
import { extractErrorMsg } from '../utils/errorUtils'
import { Spinner } from '../components/Loading'

export default function Registro() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validações atualizadas conforme o DTO
    if (!nickname.trim() || !email.trim() || !senha.trim() || !confirmar.trim()) {
      setError('Preencha todos os campos.')
      return
    }
    if (nickname.length < 3 || nickname.length > 30) {
      setError('O nickname deve ter entre 3 e 30 caracteres.')
      return
    }
    if (senha !== confirmar) { setError('As senhas não coincidem.'); return }
    if (senha.length < 8) { setError('A senha deve ter no mínimo 8 caracteres.'); return }

    setLoading(true); setError('')
    try {

      await registrar(email, nickname, senha)

      const loginRes = await login(email, senha)
      signIn(loginRes.data.token)
      navigate('/')
    } catch (err) {
      setError(extractErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }


  const passwordStrength = () => {
    if (!senha) return null
    if (senha.length < 6) return { label: 'Fraca', color: 'var(--accent)' }
    if (senha.length < 10) return { label: 'Média', color: 'var(--gold)' }
    return { label: 'Forte', color: 'var(--neon)' }
  }
  const strength = passwordStrength()

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 60px)', padding: '2rem 1.5rem',
    }}>
      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--neon)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            // Criar conta
          </p>
          <h1 style={{ fontSize: '2.5rem' }}>REGISTRAR</h1>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '2px', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--accent), var(--neon), transparent)' }} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>NICKNAME</label>
              <input
                className="input"
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Como quer ser chamado?"
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>E-MAIL</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>SENHA</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {strength && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ flex: 1, height: '2px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', background: strength.color, borderRadius: '1px',
                      width: senha.length < 6 ? '33%' : senha.length < 10 ? '66%' : '100%',
                      transition: 'width 0.3s, background 0.3s',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: strength.color, minWidth: '40px' }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>CONFIRMAR SENHA</label>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                placeholder="Repita a senha"
                autoComplete="new-password"
                style={{ borderColor: confirmar && confirmar !== senha ? 'var(--accent)' : '' }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.25rem' }}>
              {loading ? <Spinner size={18} /> : 'Criar Conta'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Já tem conta?{' '}
          <Link to="/login" style={{ color: 'var(--neon)', textDecoration: 'none', fontWeight: 500 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
