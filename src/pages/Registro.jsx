import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrar, login } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/Alert'
import { extractErrorMsg } from '../utils/errorUtils'
import { Spinner } from '../components/Loading'

function FeaturePill({ children }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-zinc-300">
      {children}
    </div>
  )
}

function FieldLabel({ children }) {
  return (
    <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400">
      {children}
    </label>
  )
}

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

    if (!nickname.trim() || !email.trim() || !senha.trim() || !confirmar.trim()) {
      setError('Preencha todos os campos.')
      return
    }

    if (nickname.length < 3 || nickname.length > 30) {
      setError('O nickname deve ter entre 3 e 30 caracteres.')
      return
    }

    if (senha !== confirmar) {
      setError('As senhas não coincidem.')
      return
    }

    if (senha.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    setLoading(true)
    setError('')

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
    if (senha.length < 8) return { label: 'Fraca', color: 'var(--accent)' }
    if (senha.length < 12) return { label: 'Média', color: 'var(--gold)' }
    return { label: 'Forte', color: 'var(--neon)' }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-[calc(100vh-64px)] overflow-hidden bg-[#090c13] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_500px]">
        <section className="hidden lg:block">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-emerald-400">
            // GAME CRITIC
          </p>

          <h1 className="mt-5 font-['Bebas_Neue'] text-[clamp(3.8rem,7vw,6.4rem)] leading-[0.9] tracking-[0.05em] text-white">
            CRIE SUA
            <br />
            CONTA E
            <br />
            PUBLIQUE
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-zinc-400">
            Faça parte da comunidade, compartilhe opiniões sobre seus jogos favoritos e construa
            um perfil com identidade própria dentro da plataforma.
          </p>

          <div className="mt-8 grid max-w-xl gap-3">
            <FeaturePill>Escreva reviews e deixe sua nota visível para outros jogadores.</FeaturePill>
            <FeaturePill>Monte um histórico pessoal com jogos, opiniões e descobertas.</FeaturePill>
            <FeaturePill>Veja de forma clara a diferença entre comunidade e fonte externa.</FeaturePill>
          </div>
        </section>

        <section className="animate-fade-up">
          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#11141d]/95 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.48)] backdrop-blur sm:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-fuchsia-400/10 blur-3xl" />

            <div className="relative">
              <div className="mb-8 text-center sm:text-left">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400">
                  // Criar conta
                </p>
                <h2 className="mt-3 font-['Bebas_Neue'] text-[3.2rem] leading-none tracking-[0.05em] text-white">
                  REGISTRAR
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Crie sua conta em poucos instantes para começar a publicar suas reviews.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && <Alert type="error" message={error} onClose={() => setError('')} />}

                <div>
                  <FieldLabel>Nickname</FieldLabel>
                  <input
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-400/10"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Como quer ser chamado?"
                    autoFocus
                    maxLength={30}
                  />
                </div>

                <div>
                  <FieldLabel>E-mail</FieldLabel>
                  <input
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-400/10"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <FieldLabel>Senha</FieldLabel>
                  <div className="relative">
                    <input
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 pr-12 text-[15px] text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-400/10"
                      type={showPassword ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>

                  {strength && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            background: strength.color,
                            width: senha.length < 8 ? '33%' : senha.length < 12 ? '66%' : '100%',
                          }}
                        />
                      </div>
                      <span
                        className="min-w-[48px] text-right text-[11px] font-mono uppercase tracking-[0.12em]"
                        style={{ color: strength.color }}
                      >
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <FieldLabel>Confirmar senha</FieldLabel>
                  <input
                    className="h-14 w-full rounded-2xl border bg-white/[0.04] px-4 text-[15px] text-white outline-none transition placeholder:text-zinc-500 focus:bg-white/[0.06] focus:ring-4"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    style={{
                      borderColor: confirmar && confirmar !== senha ? 'rgba(244,63,94,0.65)' : 'rgba(255,255,255,0.10)',
                      boxShadow: confirmar && confirmar !== senha ? '0 0 0 4px rgba(244,63,94,0.08)' : 'none',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-400 text-sm font-bold tracking-[0.04em] text-black transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Spinner size={18} /> : 'Criar conta'}
                </button>

                <p className="pt-1 text-center text-sm text-zinc-400">
                  Já tem conta?{' '}
                  <Link to="/login" className="font-semibold text-emerald-400 transition hover:text-emerald-300">
                    Entrar
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}