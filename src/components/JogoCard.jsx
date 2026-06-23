import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GENERO_LABEL, PLATAFORMA_LABEL } from '../constants/enums'
import { useAuth } from '../context/AuthContext'

function buildImage(url) {
  if (!url) return null
  return url.startsWith('http') ? url : `https:${url}`
}

function getRatingColor(media) {
  if (media >= 7.5) return 'var(--neon)'
  if (media >= 5) return 'var(--gold)'
  return 'var(--accent)'
}

export default function JogoCard({ jogo, media, onEdit, onDelete }) {
  const { isAdmin } = useAuth()
  const [hovered, setHovered] = useState(false)

  const image = buildImage(jogo.imageUrl)
  const hasRating = media !== null && media !== undefined
  const ratingColor = hasRating ? getRatingColor(media) : null

  // Inicial para fallback sem imagem
  const inicial = jogo.nome?.charAt(0).toUpperCase() ?? '?'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--surface)',
        border: `1px solid ${hovered ? 'rgba(0,255,170,0.35)' : 'var(--border)'}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,170,0.1)'
          : '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* ── HERO IMAGE 16/9 ── */}
      <div style={{ position: 'relative', aspectRatio: '2 / 3', overflow: 'hidden', flexShrink: 0 }}>
        {image ? (
          <img
            src={image}
            alt={jogo.nome}
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top', 
              transition: 'transform 0.4s ease',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        ) : (
          /* Fallback elegante */
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, var(--surface-2) 0%, #0a0f1a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '5rem', lineHeight: 1,
              color: 'rgba(255,255,255,0.06)',
              userSelect: 'none',
            }}>
              {inicial}
            </span>
          </div>
        )}

        {/* Gradiente inferior sobre a imagem */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(7,11,20,0.85) 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />

        {/* Rating — canto superior direito */}
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 2,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.75rem', fontWeight: 700,
          lineHeight: 1,
          padding: '5px 8px',
          borderRadius: '6px',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          color: hasRating ? ratingColor : 'rgba(255,255,255,0.3)',
          border: `1px solid ${hasRating ? ratingColor + '66' : 'rgba(255,255,255,0.1)'}`,
        }}>
          {hasRating ? `${Number(media).toFixed(1)}` : '—'}
        </div>

        {/* Ações de admin — aparecem no hover */}
        {isAdmin && (
          <div style={{
            position: 'absolute', top: 10, left: 10, zIndex: 2,
            display: 'flex', gap: '6px',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: hovered ? 'auto' : 'none',
          }}>
            <button
              onClick={(e) => { e.preventDefault(); onEdit?.(jogo) }}
              title="Editar jogo"
              style={{
                width: 32, height: 32, borderRadius: '8px', border: 'none',
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(0,0,0,0.75)' }}
            >
              ✎
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onDelete?.(jogo) }}
              title="Deletar jogo"
              style={{
                width: 32, height: 32, borderRadius: '8px', border: 'none',
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-dim)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.75)' }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ── CONTEÚDO ── */}
      <div style={{
        padding: '0.875rem 1rem 1rem',
        display: 'flex', flexDirection: 'column', gap: '0.6rem',
        flex: 1,
      }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span className="badge badge-muted">
            {PLATAFORMA_LABEL[jogo.plataforma] || jogo.plataforma}
          </span>
          <span className="badge badge-neon">
            {GENERO_LABEL[jogo.genero] || jogo.genero}
          </span>
        </div>

        {/* Título com line-clamp */}
        <h3 style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '1.5rem',
          letterSpacing: '0.04em',
          lineHeight: 1.1,
          color: '#fff',
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.2em', // altura reservada para 2 linhas — grid alinhado
        }}>
          {jogo.nome}
        </h3>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* CTA */}
        <Link
          to={`/jogos/${jogo.id}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0.7rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600, fontSize: '0.875rem',
            letterSpacing: '0.02em',
            background: hovered ? 'var(--neon)' : 'rgba(0,255,170,0.08)',
            color: hovered ? '#071018' : 'var(--neon)',
            border: '1px solid rgba(0,255,170,0.3)',
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
        >
          Ver Reviews
        </Link>
      </div>
    </div>
  )
}