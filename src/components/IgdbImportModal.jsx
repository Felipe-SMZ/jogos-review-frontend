import { useState, useEffect, useRef } from 'react'
import Modal from './Modal'
import { Alert } from './Alert'
import { Spinner } from './Loading'
import { buscarJogosIgdb, importarJogoIgdb } from '../services/igdbService'
import { GENEROS, PLATAFORMAS, GENERO_LABEL, PLATAFORMA_LABEL } from '../constants/enums'
import { extractErrorMsg } from '../utils/errorUtils'

// Converte unix timestamp (segundos) para ano, ou retorna null
function toYear(ts) {
  if (!ts) return null
  return new Date(ts * 1000).getFullYear()
}

// Status possíveis do modal — evita booleans conflitantes
// 'idle' | 'searching' | 'results' | 'confirming' | 'importing'

const INITIAL_STATE = {
  status: 'idle',
  termo: '',
  resultados: [],
  jogoSelecionado: null,
  genero: '',
  plataforma: '',
  erro: '',
  sucesso: '',
}

export default function IgdbImportModal({ isOpen, onClose, onSuccess }) {
  const [state, setState] = useState(INITIAL_STATE)
  const inputRef = useRef(null)

  // Reseta tudo ao abrir/fechar
  useEffect(() => {
    if (isOpen) {
      setState(INITIAL_STATE)
      // Foca o campo de busca assim que o modal abre
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const set = (patch) => setState((s) => ({ ...s, ...patch }))

  // ─── Busca ───────────────────────────────────────────────────────────────
  const handleBuscar = async (e) => {
    e?.preventDefault()
    const termo = state.termo.trim()
    if (!termo) return

    set({ status: 'searching', erro: '', resultados: [], jogoSelecionado: null })

    try {
      const res = await buscarJogosIgdb(termo)
      const lista = res.data
      if (lista.length === 0) {
        set({ status: 'results', resultados: [], erro: 'Nenhum jogo encontrado para este termo.' })
      } else {
        set({ status: 'results', resultados: lista })
      }
    } catch (err) {
      const status = err?.response?.status
      let msg = extractErrorMsg(err)
      if (status === 502) msg = 'Não foi possível conectar à IGDB. Tente novamente em instantes.'
      set({ status: 'idle', erro: msg })
    }
  }

  // ─── Seleção de jogo ─────────────────────────────────────────────────────
  const handleSelecionar = (jogo) => {
    set({
      status: 'confirming',
      jogoSelecionado: jogo,
      genero: '',
      plataforma: '',
      erro: '',
    })
  }

  // ─── Importação ──────────────────────────────────────────────────────────
  const handleImportar = async (e) => {
    e?.preventDefault()
    if (!state.genero || !state.plataforma) {
      set({ erro: 'Selecione o gênero e a plataforma antes de importar.' })
      return
    }

    set({ status: 'importing', erro: '' })

    try {
      await importarJogoIgdb({
        igdbId: state.jogoSelecionado.id,
        genero: state.genero,
        plataforma: state.plataforma,
      })
      set({ sucesso: `"${state.jogoSelecionado.name}" importado com sucesso!` })
      onSuccess?.()
      // Fecha após 1.5s para o usuário ver o feedback de sucesso
      setTimeout(onClose, 1500)
    } catch (err) {
      const status = err?.response?.status
      let msg = extractErrorMsg(err)
      if (status === 409) msg = `"${state.jogoSelecionado.name}" já existe no sistema.`
      if (status === 404) msg = 'Jogo não encontrado na IGDB. Tente outro resultado.'
      if (status === 502) msg = 'Falha na comunicação com a IGDB. Tente novamente.'
      set({ status: 'confirming', erro: msg })
    }
  }

  const voltar = () =>
    set({ status: 'results', jogoSelecionado: null, genero: '', plataforma: '', erro: '' })

  const { status, termo, resultados, jogoSelecionado, genero, plataforma, erro, sucesso } = state

  // ─── Renderização ─────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar da IGDB"
      maxWidth="600px"
    >
      {/* Feedback de sucesso */}
      {sucesso && (
        <Alert type="success" message={sucesso} />
      )}

      {/* Feedback de erro */}
      {erro && !sucesso && (
        <Alert type="error" message={erro} onClose={() => set({ erro: '' })} />
      )}

      {/* ── Tela 1: Busca ── */}
      {(status === 'idle' || status === 'searching' || status === 'results') && !sucesso && (
        <>
          <form
            onSubmit={handleBuscar}
            style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}
          >
            <input
              ref={inputRef}
              className="input"
              value={termo}
              onChange={(e) => set({ termo: e.target.value })}
              placeholder="Buscar jogo na IGDB... (ex: zelda, god of war)"
              disabled={status === 'searching'}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === 'searching' || !termo.trim()}
              style={{ whiteSpace: 'nowrap' }}
            >
              {status === 'searching' ? <Spinner size={16} /> : 'Buscar'}
            </button>
          </form>

          {/* Lista de resultados */}
          {status === 'results' && resultados.length > 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
              maxHeight: '380px', overflowY: 'auto',
            }}>
              {resultados.map((jogo) => (
                <IgdbResultCard
                  key={jogo.id}
                  jogo={jogo}
                  onSelecionar={handleSelecionar}
                />
              ))}
            </div>
          )}

          {/* Estado vazio */}
          {status === 'idle' && !erro && (
            <p style={{
              color: 'var(--text-dim)', fontSize: '0.8rem',
              fontFamily: 'JetBrains Mono, monospace', textAlign: 'center',
              padding: '2rem 0',
            }}>
              // Digite um termo e pressione Buscar
            </p>
          )}
        </>
      )}

      {/* ── Tela 2: Confirmação de importação ── */}
      {status === 'confirming' && jogoSelecionado && !sucesso && (
        <form onSubmit={handleImportar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Card do jogo selecionado */}
          <div style={{
            display: 'flex', gap: '1rem', alignItems: 'flex-start',
            padding: '1rem',
            background: 'var(--surface-2, rgba(255,255,255,0.03))',
            border: '1px solid var(--border)', borderRadius: '4px',
          }}>
            {jogoSelecionado.cover?.url && (
              <img
                src={jogoSelecionado.cover.url}
                alt={jogoSelecionado.name}
                style={{ width: '60px', borderRadius: '4px', flexShrink: 0, objectFit: 'cover' }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.4rem',
                color: 'var(--text)', letterSpacing: '0.04em',
                marginBottom: '0.25rem', lineHeight: 1.1,
              }}>
                {jogoSelecionado.name}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                {toYear(jogoSelecionado.first_release_date) && (
                  <span className="badge badge-muted">
                    {toYear(jogoSelecionado.first_release_date)}
                  </span>
                )}
                {jogoSelecionado.rating && (
                  <span className="badge badge-neon">
                    ★ {jogoSelecionado.rating.toFixed(0)}
                  </span>
                )}
              </div>
              {jogoSelecionado.platforms?.length > 0 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {jogoSelecionado.platforms.map((p) => p.name).join(' · ')}
                </p>
              )}
            </div>
          </div>

          {/* Instrução */}
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Escolha o gênero e a plataforma no catálogo do sistema:
          </p>

          {/* Select: Gênero */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
              GÊNERO
            </label>
            <select
              className="input"
              value={genero}
              onChange={(e) => set({ genero: e.target.value })}
            >
              <option value="">Selecione o gênero...</option>
              {GENEROS.map((g) => (
                <option key={g} value={g}>{GENERO_LABEL[g]}</option>
              ))}
            </select>
          </div>

          {/* Select: Plataforma */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
              PLATAFORMA
            </label>
            <select
              className="input"
              value={plataforma}
              onChange={(e) => set({ plataforma: e.target.value })}
            >
              <option value="">Selecione a plataforma...</option>
              {PLATAFORMAS.map((p) => (
                <option key={p} value={p}>{PLATAFORMA_LABEL[p]}</option>
              ))}
            </select>
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={voltar}
              className="btn btn-ghost"
              style={{ flex: 1 }}
            >
              ← Voltar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === 'importing' || !genero || !plataforma}
              style={{ flex: 2 }}
            >
              {status === 'importing' ? <Spinner size={16} /> : 'Importar Jogo'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

// ─── Subcomponente: Card de resultado da IGDB ──────────────────────────────
function IgdbResultCard({ jogo, onSelecionar }) {
  return (
    <button
      onClick={() => onSelecionar(jogo)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        width: '100%', textAlign: 'left',
        padding: '0.75rem',
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        cursor: 'pointer',
        color: 'var(--text)',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--neon)'
        e.currentTarget.style.background = 'rgba(0,255,170,0.04)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {/* Capa */}
      {jogo.cover?.url ? (
        <img
          src={jogo.cover.url}
          alt={jogo.name}
          style={{ width: '44px', height: '60px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: '44px', height: '60px', flexShrink: 0, borderRadius: '2px',
          background: 'var(--border)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.2rem',
        }}>
          🎮
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.1rem',
          letterSpacing: '0.04em', color: 'var(--text)',
          marginBottom: '0.2rem', lineHeight: 1.1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {jogo.name}
        </p>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
          {toYear(jogo.first_release_date) && (
            <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
              {toYear(jogo.first_release_date)}
            </span>
          )}
          {jogo.rating && (
            <span className="badge badge-neon" style={{ fontSize: '0.65rem' }}>
              ★ {jogo.rating.toFixed(0)}
            </span>
          )}
          {jogo.platforms?.slice(0, 3).map((p) => (
            <span key={p.name} className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
              {p.name}
            </span>
          ))}
          {jogo.platforms?.length > 3 && (
            <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
              +{jogo.platforms.length - 3}
            </span>
          )}
        </div>
        {jogo.summary && (
          <p style={{
            fontSize: '0.72rem', color: 'var(--text-dim)',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {jogo.summary}
          </p>
        )}
      </div>

      {/* Seta */}
      <span style={{ color: 'var(--neon)', fontSize: '1rem', flexShrink: 0 }}>›</span>
    </button>
  )
}