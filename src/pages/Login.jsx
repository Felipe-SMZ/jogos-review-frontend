import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { Alert } from "../components/Alert"
import { extractErrorMsg } from '../utils/errorUtils'
import { Spinner } from '../components/Loading'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !senha.trim()) { setError('Preencha todos os campos.'); return }
    setLoading(true); setError('')
    try {
      const res = await login(email, senha)
      signIn(res.data.token)
      navigate(from, { replace: true })
    } catch (err) {
      setError(extractErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 60px)', padding: '2rem 1.5rem',
    }}>
      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--neon)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            // Acesso à conta
          </p>
          <h1 style={{ fontSize: '2.5rem' }}>ENTRAR</h1>
        </div>

        {/* Form card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '2px', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--neon), transparent)' }} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>
                E-MAIL
              </label>
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
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>
                SENHA
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-dim)', fontSize: '0.8rem', padding: '4px',
                  }}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.25rem' }}>
              {loading ? <Spinner size={18} /> : 'Entrar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Não tem conta?{' '}
          <Link to="/registro" style={{ color: 'var(--neon)', textDecoration: 'none', fontWeight: 500 }}>
            Registrar
          </Link>
        </p>
      </div>
    </div>
  )
}
