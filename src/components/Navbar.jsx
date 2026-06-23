import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function navClass({ isActive }) {
  return [
    'relative rounded-xl px-3 py-2 text-sm transition',
    isActive
      ? 'bg-emerald-400/10 text-emerald-300'
      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200',
  ].join(' ')
}

export default function Navbar() {
  const { isAuthenticated, isAdmin, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[#0d1118]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-6 md:px-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-['Bebas_Neue'] text-3xl tracking-[0.08em] text-white">
            <span className="text-emerald-400">GAME</span> CRITIC
          </span>
          <span className="mt-1 text-pink-500">•</span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" className={navClass} end>
              Jogos
            </NavLink>

            {isAuthenticated && isAdmin && (
              <NavLink to="/admin/importar" className={navClass}>
                Importar
              </NavLink>
            )}
          </nav>

          {isAuthenticated && isAdmin && (
            <span className="hidden rounded-lg border border-rose-500/25 bg-rose-500/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-rose-300 md:inline-flex">
              Admin
            </span>
          )}

          {!isAuthenticated ? (
            <>
              <NavLink
                to="/login"
                className="rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
              >
                Login
              </NavLink>

              <NavLink
                to="/registro"
                className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Cadastrar
              </NavLink>
            </>
          ) : (
            <button
              onClick={signOut}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.05]"
            >
              Sair
            </button>
          )}
        </div>
      </div>
    </header>
  )
}