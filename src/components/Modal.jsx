import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, maxWidth = '480px' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(4,6,10,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up"
        style={{
          background: 'linear-gradient(145deg, rgba(14,20,36,0.99), rgba(7,11,20,1))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          width: '100%', maxWidth,
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,255,170,0.04)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <h3 style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '1.3rem', letterSpacing: '0.06em',
            color: 'var(--text)', margin: 0,
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '1.4rem', lineHeight: 1,
              padding: '4px 6px', transition: 'color 0.15s',
              borderRadius: '6px',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  )
}