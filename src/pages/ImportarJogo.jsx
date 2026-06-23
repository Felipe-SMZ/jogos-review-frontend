import { useState } from 'react'
import { buscarJogosIgdb } from '../services/igdbService'
import { extractErrorMsg } from '../utils/errorUtils'
import IgdbGameCard from '../components/IgdbGameCard'
import ImportarModal from '../components/ImportarModal'
import { Alert } from '../components/Alert'

const SUGESTOES = ['God of War', 'Zelda', 'Hollow Knight', 'Red Dead', 'Elden Ring', 'Hades']

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/8 bg-[#121824]">
      <div className="skeleton aspect-[3/4] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-24 rounded-lg" />
        <div className="skeleton h-8 w-full rounded-lg" />
        <div className="skeleton h-4 w-2/3 rounded-lg" />
        <div className="skeleton h-20 w-full rounded-xl" />
        <div className="flex items-center justify-between gap-3">
          <div className="skeleton h-8 w-20 rounded-lg" />
          <div className="skeleton h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function EstadoInicial({ onSugestao }) {
  return (
    <div className="mt-10 rounded-3xl border border-white/6 bg-white/[0.02] p-6 backdrop-blur-sm md:p-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">
          Fluxo de importação
        </div>

        <h2 className="font-['Bebas_Neue'] text-4xl tracking-[0.06em] text-white md:text-5xl">
          BUSQUE UM JOGO NA <span className="text-emerald-400">IGDB</span>
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-400 md:text-base">
          Digite um nome, compare capa, nota e plataformas e importe o jogo para o catálogo com o mapeamento correto.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {SUGESTOES.map((s) => (
            <button
              key={s}
              onClick={() => onSugestao(s)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-300"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-3 text-left md:grid-cols-3">
          <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">1. Buscar</p>
            <p className="text-sm text-zinc-300">Digite o nome da franquia, do jogo ou um termo próximo.</p>
          </div>

          <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">2. Selecionar</p>
            <p className="text-sm text-zinc-300">Compare capa, ano, nota e plataformas para achar o item certo.</p>
          </div>

          <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">3. Importar</p>
            <p className="text-sm text-zinc-300">Associe gênero e plataforma do sistema e confirme a importação.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ImportarJogo() {
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [buscou, setBuscou] = useState(false)
  const [termoAtual, setTermoAtual] = useState('')
  const [modalGame, setModalGame] = useState(null)

  const executarBusca = async (valor) => {
    const termoLimpo = valor.trim()
    if (!termoLimpo) return

    setLoading(true)
    setError('')
    setSuccess('')
    setBuscou(false)
    setTermoAtual(termoLimpo)

    try {
      const res = await buscarJogosIgdb(termoLimpo)
      setResultados(res.data || [])
      setBuscou(true)
    } catch (err) {
      setResultados([])
      setError(extractErrorMsg(err))
      setBuscou(true)
    } finally {
      setLoading(false)
    }
  }

  const handleBuscar = async (e) => {
    e.preventDefault()
    executarBusca(termo)
  }

  const handleSugestao = (sugestao) => {
    setTermo(sugestao)
    executarBusca(sugestao)
  }

  const handleImportSuccess = (message) => {
    setSuccess(message)

    if (modalGame) {
      setResultados((prev) => prev.filter((item) => item.id !== modalGame.id))
    }

    setModalGame(null)
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 lg:px-8 xl:px-10">
      <div className="mb-8 max-w-3xl">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400">
          // Admin · IGDB
        </p>

        <h1 className="font-['Bebas_Neue'] text-[clamp(2.5rem,5vw,4.6rem)] leading-none tracking-[0.06em] text-white">
          IMPORTAR JOGO <span className="text-emerald-400">VIA IGDB</span>
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
          Busque jogos na base da IGDB, compare os resultados visualmente e importe para o sistema com o mapeamento correto de gênero e plataforma.
        </p>
      </div>

      <div className="rounded-3xl border border-white/6 bg-white/[0.02] p-4 backdrop-blur-sm md:p-5">
        <form onSubmit={handleBuscar} className="flex flex-col gap-3 lg:flex-row">
          <div className="flex-1">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Nome do jogo
            </label>

            <input
              type="text"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Ex: God of War, Zelda, Hollow Knight..."
              disabled={loading}
              autoFocus
              className="h-14 w-full rounded-2xl border border-white/10 bg-[#171b25] px-4 text-[15px] text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10"
            />
          </div>

          <div className="lg:self-end">
            <button
              type="submit"
              disabled={loading || !termo.trim()}
              className="h-14 w-full min-w-[140px] rounded-2xl bg-emerald-400 px-6 text-sm font-bold tracking-[0.08em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
            >
              {loading ? 'BUSCANDO...' : 'BUSCAR'}
            </button>
          </div>
        </form>

        {!buscou && !loading && (
          <div className="mt-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              Sugestões de busca
            </p>

            <div className="flex flex-wrap gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSugestao(s)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 transition hover:border-emerald-400/25 hover:bg-emerald-400/10 hover:text-emerald-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6">
          <Alert type="error" message={error} />
        </div>
      )}

      {success && (
        <div className="mt-6">
          <Alert type="success" message={success} />
        </div>
      )}

      {!buscou && !loading && resultados.length === 0 ? (
        <EstadoInicial onSugestao={handleSugestao} />
      ) : (
        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                Resultado da busca
              </p>

              <p className="mt-1 text-sm text-zinc-300 md:text-base">
                <span className="font-bold text-white">{resultados.length}</span>{' '}
                resultado(s) para{' '}
                <span className="font-semibold text-emerald-400">"{termoAtual}"</span>.
              </p>
            </div>

            <p className="text-sm text-zinc-500">
              Selecione um card para revisar e importar.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : resultados.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/8 bg-white/[0.02] px-6 py-14 text-center">
              <p className="font-['Bebas_Neue'] text-3xl tracking-[0.06em] text-zinc-200">
                NENHUM RESULTADO ENCONTRADO
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Tente outro termo, nome alternativo ou franchise.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {resultados.map((game, i) => (
                <div
                  key={game.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <IgdbGameCard game={game} onImportar={setModalGame} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <ImportarModal
        isOpen={!!modalGame}
        game={modalGame}
        onClose={() => setModalGame(null)}
        onSuccess={handleImportSuccess}
      />
    </div>
  )
}