import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GENERO_LABEL, PLATAFORMA_LABEL } from '../constants/enums'
import { useAuth } from '../context/AuthContext'

function buildImage(url) {
  if (!url) return null
  return url.startsWith('http') ? url : `https:${url}`
}

function ratingColor(m) {
  if (m >= 7.5) return '#00ffaa'
  if (m >= 5)   return '#ffc800'
  return '#ff3b5c'
}

export default function JogoCard({ jogo, media, onEdit, onDelete }) {
  const { isAdmin } = useAuth()
  const [hovered, setHovered] = useState(false)

  const image    = buildImage(jogo.imageUrl)
  const hasRating = media !== null && media !== undefined && Number(media) > 0
  const cor       = hasRating ? ratingColor(Number(media)) : null
  const inicial   = jogo.nome?.charAt(0).toUpperCase() ?? '?'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--surface)',
        border: `1px solid ${hovered ? 'rgba(0,255,170,0.3)' : 'var(--border)'}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,255,170,0.08)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        cursor: 'default',
      }}
    >
      {/* Capa 2:3 */}
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
              objectFit: 'cover', objectPosition: 'center top',
              transition: 'transform 0.4s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              display: 'block',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, var(--surface-2) 0%, #0a0f1a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '5rem', lineHeight: 1,
              color: 'rgba(255,255,255,0.05)',
              userSelect: 'none',
            }}>
              {inicial}
            </span>
          </div>
        )}

        {/* Gradiente inferior */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(7,11,20,0.9) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        {/* Badge de rating */}
        <div style={{
          position: 'absolute', top: 8, right: 8, zIndex: 2,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.72rem', fontWeight: 700, lineHeight: 1,
          padding: '4px 7px', borderRadius: '6px',
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(8px)',
          color: hasRating ? cor : 'rgba(255,255,255,0.2)',
          border: `1px solid ${hasRating ? cor + '55' : 'rgba(255,255,255,0.07)'}`,
        }}>
          {hasRating ? Number(media).toFixed(1) : '—'}
        </div>

        {/* Ações admin no hover */}
        {isAdmin && (
          <div style={{
            position: 'absolute', top: 8, left: 8, zIndex: 2,
            display: 'flex', gap: '5px',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.18s',
            pointerEvents: hovered ? 'auto' : 'none',
          }}>
            <button
              onClick={(e) => { e.preventDefault(); onEdit?.(jogo) }}
              title="Editar"
              style={{
                width: 30, height: 30, borderRadius: '7px',
                border: 'none',
                background: 'rgba(0,0,0,0.78)',
                backdropFilter: 'blur(8px)',
                color: 'rgba(255,255,255,0.55)',
                cursor: 'pointer', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'rgba(0,0,0,0.78)' }}
            >
              ✎
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onDelete?.(jogo) }}
              title="Deletar"
              style={{
                width: 30, height: 30, borderRadius: '7px',
                border: 'none',
                background: 'rgba(0,0,0,0.78)',
                backdropFilter: 'blur(8px)',
                color: '#ff3b5c',
                cursor: 'pointer', fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,59,92,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.78)'}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{
        padding: '0.75rem 0.875rem 0.875rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        flex: 1,
      }}>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          <span className="badge badge-muted">
            {PLATAFORMA_LABEL[jogo.plataforma] || jogo.plataforma}
          </span>
          <span className="badge badge-neon">
            {GENERO_LABEL[jogo.genero] || jogo.genero}
          </span>
        </div>

        <h3 style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '1.25rem',
          letterSpacing: '0.04em', lineHeight: 1.15,
          color: '#fff', margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.3em',
        }}>
          {jogo.nome}
        </h3>

        <div style={{ flex: 1 }} />

        <Link
          to={`/jogos/${jogo.id}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0.55rem', borderRadius: '7px',
            textDecoration: 'none',
            fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.03em',
            background: hovered ? 'rgba(0,255,170,0.12)' : 'transparent',
            color: 'var(--neon)',
            border: '1px solid rgba(0,255,170,0.18)',
            transition: 'background 0.2s',
          }}
        >
          Ver Reviews
        </Link>
      </div>
    </div>
  )
}