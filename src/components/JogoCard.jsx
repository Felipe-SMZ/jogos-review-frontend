import { Link } from 'react-router-dom'
import { GENERO_LABEL, PLATAFORMA_LABEL } from '../constants/enums'
import { StarDisplay } from './StarRating'
import { useAuth } from '../context/AuthContext'

export default function JogoCard({ jogo, media, onEdit, onDelete }) {
  const { isAdmin } = useAuth()

  const hasReviews =
    media !== null &&
    media !== undefined &&
    Number(media) > 0

  return (
    <div
      className="card"
      style={{
        position: 'relative',
        overflow: 'hidden',

        minHeight: '250px',
        padding: '1.5rem',

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',

        background:
          'linear-gradient(145deg, rgba(14,20,36,0.98), rgba(7,11,20,1))',

        border: '1px solid rgba(0,255,170,0.16)',
        borderRadius: '22px',

        boxShadow:
          '0 10px 30px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.02)',

        transition: 'all .25s ease',
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at top right, rgba(0,255,170,0.12), transparent 35%)',
        }}
      />

      {/* CONTENT */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* TOP */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Badges */}
          <div
            style={{
              display: 'flex',
              gap: '0.45rem',
              flexWrap: 'wrap',
            }}
          >
            <span className="badge badge-muted">
              {PLATAFORMA_LABEL[jogo.plataforma] || jogo.plataforma}
            </span>

            <span className="badge badge-neon">
              {GENERO_LABEL[jogo.genero] || jogo.genero}
            </span>
          </div>

          {/* Nota */}
          <div
            style={{
              minWidth: '86px',
              minHeight: '74px',

              padding: '0.7rem',

              borderRadius: '16px',

              background: hasReviews
                ? 'rgba(0,255,170,0.08)'
                : 'rgba(255,255,255,0.03)',

              border: hasReviews
                ? '1px solid rgba(0,255,170,0.18)'
                : '1px solid rgba(255,255,255,0.06)',

              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',

              textAlign: 'center',
            }}
          >
            {hasReviews ? (
              <>
                <StarDisplay nota={media} size="0.62rem" />

                <span
                  style={{
                    marginTop: '0.35rem',
                    color: '#00ffaa',
                    fontWeight: 800,
                    fontSize: '1rem',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {Number(media).toFixed(1)}
                </span>
              </>
            ) : (
              <span
                style={{
                  fontSize: '0.72rem',
                  lineHeight: 1.3,
                  color: 'rgba(255,255,255,0.45)',
                  fontWeight: 600,
                }}
              >
                Sem avaliações
              </span>
            )}
          </div>
        </div>

        {/* Título */}
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '2.3rem',
              letterSpacing: '0.04em',
              lineHeight: 1,
              color: '#fff',

              margin: 0,
              marginBottom: '1rem',
            }}
          >
            {jogo.nome}
          </h3>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: '0.6rem',
            marginTop: '1.5rem',
          }}
        >
          <Link
            to={`/jogos/${jogo.id}`}
            style={{
              flex: 1,

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              padding: '0.95rem',

              borderRadius: '14px',

              textDecoration: 'none',

              fontWeight: 800,
              fontSize: '0.95rem',

              background:
                'linear-gradient(90deg, #00ffaa 0%, #00d9ff 100%)',

              color: '#071018',

              boxShadow: '0 0 25px rgba(0,255,170,0.18)',

              transition: 'all .2s ease',
            }}
          >
            Ver Reviews
          </Link>

          {isAdmin && (
            <>
              <button
                onClick={() => onEdit?.(jogo)}
                className="btn btn-ghost"
                title="Editar jogo"
              >
                ✎
              </button>

              <button
                onClick={() => onDelete?.(jogo)}
                className="btn btn-danger"
                title="Deletar jogo"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}