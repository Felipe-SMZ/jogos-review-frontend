import { StarPicker } from './StarRating'
import { Spinner } from './Loading'

export default function ReviewFormCard({
  disabled,
  nota,
  setNota,
  comentario,
  setComentario,
  loading,
  onSubmit,
}) {
  return (
    <div className="rounded-[24px] border border-emerald-400/12 bg-[linear-gradient(180deg,rgba(19,45,52,0.9),rgba(15,23,36,1))] shadow-[0_12px_30px_rgba(0,0,0,0.18)] xl:sticky xl:top-24">
      <div className="border-b border-white/6 px-4 py-4 sm:px-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
          Nova review
        </p>

        <h3 className="mt-1 font-['Bebas_Neue'] text-[1.8rem] leading-none tracking-[0.04em] text-white sm:text-[1.9rem]">
          ESCREVER OPINIÃO
        </h3>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            Sua nota
          </p>

          <StarPicker value={nota} onChange={setNota} />
        </div>

        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            Comentário
          </p>

          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={6}
            maxLength={500}
            disabled={disabled || loading}
            placeholder="Escreva sua opinião sobre o jogo..."
            className="w-full rounded-2xl border border-white/10 bg-[#1b1f2b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ resize: 'vertical' }}
          />

          <div className="mt-2 text-right text-[11px] text-zinc-500">
            {comentario.length}/500
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || loading || !nota || !comentario.trim()}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-400 px-5 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Spinner size={16} /> : 'Publicar review'}
        </button>
      </div>
    </div>
  )
}