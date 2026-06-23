import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login } from '../services/authService'
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

    if (!email.trim() || !senha.trim()) {
      setError('Preencha todos os campos.')
      return
    }

    setLoading(true)
    setError('')

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
    <div className="min-h-[calc(100vh-64px)] overflow-hidden bg-[#090c13] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_480px]">
        <section className="hidden lg:block">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-emerald-400">
            // GAME CRITIC
          </p>

          <h1 className="mt-5 font-['Bebas_Neue'] text-[clamp(3.8rem,7vw,6.4rem)] leading-[0.9] tracking-[0.05em] text-white">
            ENTRE E
            <br />
            CONTINUE SUA
            <br />
            JORNADA
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-zinc-400">
            Acesse sua conta para publicar reviews, acompanhar as notas da comunidade e manter
            seu catálogo pessoal sempre atualizado.
          </p>

          <div className="mt-8 grid max-w-xl gap-3">
            <FeaturePill>Publique opiniões com visual editorial e foco em comunidade.</FeaturePill>
            <FeaturePill>Compare sua nota com a avaliação do IGDB de forma clara.</FeaturePill>
            <FeaturePill>Volte para os jogos que você acompanha em poucos cliques.</FeaturePill>
          </div>
        </section>

        <section className="animate-fade-up">
          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#11141d]/95 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.48)] backdrop-blur sm:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">
              <div className="mb-8 text-center sm:text-left">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400">
                  // Acesso à conta
                </p>
                <h2 className="mt-3 font-['Bebas_Neue'] text-[3.2rem] leading-none tracking-[0.05em] text-white">
                  ENTRAR
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Faça login para continuar avaliando, descobrindo e organizando seus jogos.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && <Alert type="error" message={error} onClose={() => setError('')} />}

                <div>
                  <FieldLabel>E-mail</FieldLabel>
                  <input
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-400/10"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    autoFocus
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
                      placeholder="Digite sua senha"
                      autoComplete="current-password"
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-400 text-sm font-bold tracking-[0.04em] text-black transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Spinner size={18} /> : 'Entrar na conta'}
                </button>

                <p className="pt-1 text-center text-sm text-zinc-400">
                  Não tem conta?{' '}
                  <Link to="/registro" className="font-semibold text-emerald-400 transition hover:text-emerald-300">
                    Registrar
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