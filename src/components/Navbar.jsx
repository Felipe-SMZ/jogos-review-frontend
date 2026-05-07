import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <nav className="page-container" style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.6rem', color: 'var(--neon)', letterSpacing: '0.1em', lineHeight: 1 }}>
            GAME
          </span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.6rem', color: 'var(--text)', letterSpacing: '0.1em', lineHeight: 1 }}>
            CRITIC
          </span>
          <span style={{ width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%', marginLeft: '2px' }} />
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="nav-desktop">
          <Link
            to="/"
            style={{
              textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
              color: isActive('/') ? 'var(--neon)' : 'var(--text-muted)',
              letterSpacing: '0.03em', transition: 'color 0.15s',
            }}
          >
            Jogos
          </Link>

          {isAuthenticated ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {user?.email?.split('@')[0]}
                  {isAdmin && <span className="badge badge-accent" style={{ marginLeft: '6px' }}>ADMIN</span>}
                </span>
                <button onClick={handleSignOut} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                  Sair
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                Entrar
              </Link>
              <Link to="/registro" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                Registrar
              </Link>
            </div>
          )}
        </div>
      </nav>

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { gap: 0.75rem !important; }
        }
      `}</style>
    </header>
  )
}
