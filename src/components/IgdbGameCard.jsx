import { useState } from 'react'
import { PLATAFORMA_LABEL } from '../constants/enums'

const IGDB_PLATAFORMA_MAP = {
  'PlayStation 4': 'PS4',
  'PlayStation 5': 'PS5',
  'Xbox One': 'XBOX_ONE',
  'Xbox Series X': 'XBOX_SERIES_X',
  'Xbox Series S': 'XBOX_SERIES_S',
  'PC (Microsoft Windows)': 'PC',
  'Nintendo Switch': 'NINTENDO_SWITCH',
  'Android': 'MOBILE',
  'iOS': 'MOBILE',
}

function getRatingColor(rating) {
  if (!rating) return 'var(--text-muted)'
  if (rating >= 80) return 'var(--neon)'
  if (rating >= 60) return 'var(--gold)'
  return 'var(--accent)'
}

function getRatingGlow(rating) {
  if (!rating) return 'none'
  if (rating >= 80) return '0 0 10px var(--neon-dim)'
  if (rating >= 60) return '0 0 10px rgba(255,215,0,0.3)'
  return '0 0 10px var(--accent-dim)'
}

function formatDate(unix) {
  if (!unix) return null
  return new Date(unix * 1000).getFullYear()
}

export default function IgdbGameCard({ game, onImportar }) {
  // FIX 1: controlar hover via state React em vez de CSS puro
  // Isso garante que pointer-events nunca bloqueie o clique
  const [hovered, setHovered] = useState(false)

  const coverUrl = game.cover?.url
    ? game.cover.url.replace('t_thumb', 't_cover_big')
    : null

  const ano = formatDate(game.first_release_date)
  const ratingColor = getRatingColor(game.rating)
  const ratingGlow = getRatingGlow(game.rating)

  const plataformasLabels = game.platforms
    ?.map(p => {
      const key = IGDB_PLATAFORMA_MAP[p.name]
      return key ? PLATAFORMA_LABEL[key] : p.name
    })
    .filter(Boolean)
    .slice(0, 3) ?? []

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        aspectRatio: '2 / 3',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: `1px solid ${hovered ? 'var(--neon)' : 'var(--border)'}`,
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        background: 'var(--surface)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px var(--neon-dim)'
          : 'none',
      }}
    >
      {/* Capa */}
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={game.name}
          loading="lazy"
          decoding="async"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--surface-2)',
          color: 'var(--text-dim)',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '0.9rem',
          letterSpacing: '0.05em',
        }}>
          SEM CAPA
        </div>
      )}

      {/* Rating badge */}
      {game.rating && (
        <div style={{
          position: 'absolute', top: '10px', right: '10px', zIndex: 3,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          border: `1px solid ${ratingColor}`,
          borderRadius: '6px',
          padding: '3px 7px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: ratingColor,
          boxShadow: ratingGlow,
          lineHeight: 1.4,
        }}>
          {Math.round(game.rating)}
        </div>
      )}

      {/* Overlay inferior fixo — nome + plataformas */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
        padding: '2.5rem 0.75rem 0.75rem',
        // FIX 2: nunca bloquear eventos nesse overlay passivo
        pointerEvents: 'none',
      }}>
        <p style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '1.05rem',
          letterSpacing: '0.04em',
          color: '#fff',
          lineHeight: 1.1,
          marginBottom: '0.4rem',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        }}>
          {game.name}
          {ano && (
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.62rem',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.45)',
              marginLeft: '6px',
              verticalAlign: 'middle',
            }}>
              {ano}
            </span>
          )}
        </p>

        {plataformasLabels.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {plataformasLabels.map(label => (
              <span key={label} className="badge badge-muted" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover overlay — summary + botão importar */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 4,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '1rem',
        // FIX 3: pointer-events só ativo quando visível — sem isso bloqueia cliques quando oculto
        opacity: hovered ? 1 : 0,
        pointerEvents: hovered ? 'auto' : 'none',
        transition: 'opacity 0.2s ease',
      }}>
        {game.summary && (
          <p style={{
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.5,
            marginBottom: '0.85rem',
            display: '-webkit-box',
            WebkitLineClamp: 6,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {game.summary}
          </p>
        )}

        <button
          className="btn btn-primary"
          onClick={(e) => {
            e.stopPropagation()
            onImportar(game)
          }}
          style={{ width: '100%', justifyContent: 'center', fontWeight: 700, letterSpacing: '0.05em' }}
        >
          + Importar
        </button>
      </div>
    </div>
  )
}