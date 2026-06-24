import { useState, useEffect } from 'react'
import Modal from './Modal'
import { Alert } from '../components/Alert'
import { extractErrorMsg } from '../utils/errorUtils'
import { Spinner } from './Loading'
import { criarJogo, editarJogo } from '../services/jogosService'
import { GENEROS, PLATAFORMAS } from '../constants/enums'
import {
  getGeneroLabel,
  getPlataformaLabel,
} from '../utils/jogoFormatters'

function normalizePlataformas(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.filter(Boolean))]
  }

  if (typeof value === 'string' && value.trim()) {
    return [value]
  }

  return []
}

function buildInitialForm(jogo) {
  if (!jogo) {
    return {
      nome: '',
      genero: '',
      plataformas: [],
      imageUrl: '',
      summary: '',
      rating: '',
    }
  }

  return {
    nome: jogo.nome ?? '',
    genero: jogo.genero ?? '',
    plataformas: normalizePlataformas(jogo.plataformas ?? jogo.plataforma),
    imageUrl: jogo.imageUrl ?? '',
    summary: jogo.summary ?? '',
    rating: jogo.rating ?? '',
  }
}

function isSafeHttpUrl(value) {
  if (!value) return true

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function Label({ children, required = false }) {
  return (
    <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
      {children}
      {required && <span className="ml-1 text-emerald-400">*</span>}
    </label>
  )
}

function FieldHint({ children }) {
  return (
    <p className="mt-2 text-xs text-zinc-500">{children}</p>
  )
}

export default function JogoForm({ isOpen, onClose, jogo, onSuccess }) {
  const isEditing = !!jogo

  const [form, setForm] = useState(buildInitialForm(null))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mostrarExtras, setMostrarExtras] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm(buildInitialForm(jogo))
      setError('')
      setMostrarExtras(Boolean(jogo?.imageUrl || jogo?.summary || jogo?.rating))
    }
  }, [isOpen, jogo])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handlePlataformaToggle = (plataforma) => {
    setForm((current) => {
      const selecionadas = normalizePlataformas(current.plataformas)

      if (selecionadas.includes(plataforma)) {
        return {
          ...current,
          plataformas: selecionadas.filter((item) => item !== plataforma),
        }
      }

      return {
        ...current,
        plataformas: [...selecionadas, plataforma],
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const plataformasSelecionadas = normalizePlataformas(form.plataformas)

    if (!form.nome.trim() || !form.genero || !plataformasSelecionadas.length) {
      setError('Preencha nome, gênero e pelo menos uma plataforma.')
      return
    }

    const cleanedImageUrl = form.imageUrl?.trim() || ''

    if (cleanedImageUrl && !isSafeHttpUrl(cleanedImageUrl)) {
      setError('Informe uma URL de imagem válida começando com http:// ou https://.')
      return
    }

    const parsedRating =
      form.rating === '' || form.rating === null || form.rating === undefined
        ? null
        : Number(form.rating)

    if (
      parsedRating !== null &&
      (Number.isNaN(parsedRating) || parsedRating < 0 || parsedRating > 100)
    ) {
      setError('A nota deve estar entre 0 e 100.')
      return
    }

    const payload = {
      nome: form.nome.trim(),
      genero: form.genero,
      plataformas: plataformasSelecionadas,
      imageUrl: cleanedImageUrl || null,
      summary: form.summary?.trim() ? form.summary.trim() : null,
      rating: parsedRating,
    }

    setLoading(true)
    setError('')

    try {
      if (isEditing) {
        await editarJogo(jogo.id, payload)
      } else {
        await criarJogo(payload)
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(extractErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Jogo' : 'Novo Jogo'}>
      <div className="w-full max-w-2xl">
        <div className="mb-5 border-b border-white/6 pb-4">
          <h3 className="font-['Bebas_Neue'] text-2xl tracking-[0.06em] text-white">
            {isEditing ? 'ATUALIZAR JOGO' : 'CRIAR NOVO JOGO'}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Preencha os dados principais para cadastrar o jogo no catálogo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <section className="rounded-2xl border border-white/6 bg-white/[0.02] p-4 md:p-5">
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-400">
                Dados principais
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Estes campos definem como o jogo aparece e é filtrado no sistema.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label required>Nome do jogo</Label>
                <input
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#171b25] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Ex: The Last of Us Part II"
                  maxLength={120}
                  autoFocus
                />
                <FieldHint>Use o nome oficial ou o título mais reconhecido pelos usuários.</FieldHint>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label required>Gênero</Label>
                  <select
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#171b25] px-4 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10"
                    name="genero"
                    value={form.genero}
                    onChange={handleChange}
                  >
                    <option value="">Selecione o gênero...</option>
                    {GENEROS.map((g) => (
                      <option key={g} value={g}>
                        {getGeneroLabel(g)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label required>Plataformas</Label>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {PLATAFORMAS.map((p) => {
                      const checked = (form.plataformas || []).includes(p)

                      return (
                        <label
                          key={p}
                          className={`flex min-h-[48px] items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                            checked
                              ? 'border-emerald-400/40 bg-emerald-400/10 text-white'
                              : 'border-white/10 bg-[#171b25] text-zinc-300 hover:border-white/20'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handlePlataformaToggle(p)}
                            className="h-4 w-4 accent-emerald-400"
                          />
                          <span>{getPlataformaLabel(p)}</span>
                        </label>
                      )
                    })}
                  </div>

                  <FieldHint>Selecione uma ou mais plataformas compatíveis com o jogo.</FieldHint>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/6 bg-white/[0.02] p-4 md:p-5">
            <button
              type="button"
              onClick={() => setMostrarExtras((v) => !v)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                  Informações extras
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Campos opcionais para enriquecer a apresentação do jogo.
                </p>
              </div>

              <span className="text-sm font-medium text-emerald-300">
                {mostrarExtras ? 'Ocultar' : 'Mostrar'}
              </span>
            </button>

            {mostrarExtras && (
              <div className="mt-5 space-y-4">
                <div>
                  <Label>URL da imagem</Label>
                  <input
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#171b25] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://exemplo.com/capa.jpg"
                    inputMode="url"
                    autoComplete="url"
                  />
                  <FieldHint>Aceita apenas URLs começando com http:// ou https://.</FieldHint>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
                  <div>
                    <Label>Resumo</Label>
                    <textarea
                      className="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-[#171b25] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10"
                      name="summary"
                      value={form.summary}
                      onChange={handleChange}
                      placeholder="Descrição do jogo, contexto ou sinopse..."
                      maxLength={1500}
                    />
                    <div className="mt-2 text-right font-mono text-[11px] text-zinc-600">
                      {form.summary.length}/1500
                    </div>
                  </div>

                  <div>
                    <Label>Nota IGDB / catálogo</Label>
                    <input
                      className="h-12 w-full rounded-xl border border-white/10 bg-[#171b25] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10"
                      name="rating"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.rating}
                      onChange={handleChange}
                      placeholder="Ex: 92.04"
                    />
                    <FieldHint>Valor entre 0 e 100.</FieldHint>
                  </div>
                </div>
              </div>
            )}
          </section>

          <div className="mt-1 flex flex-col-reverse gap-3 border-t border-white/6 pt-4 md:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="h-12 flex-1 rounded-xl border border-white/10 bg-transparent px-4 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.03]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 flex-1 items-center justify-center rounded-xl bg-emerald-400 px-4 text-sm font-bold tracking-[0.04em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Spinner size={16} /> : isEditing ? 'Salvar Alterações' : 'Criar Jogo'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}