import { GENERO_LABEL, PLATAFORMA_LABEL } from '../constants/enums'

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x900/0b1220/e5e7eb?text=Sem+Capa'

export function formatEnumFallback(value) {
  if (!value || !String(value).trim()) return 'Outros'

  return String(value)
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getGeneroLabel(value) {
  if (!value) return 'Outros'
  return GENERO_LABEL[value] || formatEnumFallback(value)
}

export function getPlataformaLabel(value) {
  if (!value) return 'Outros'
  return PLATAFORMA_LABEL[value] || formatEnumFallback(value)
}

export function normalizePlataformas(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.filter(Boolean))]
  }

  if (typeof value === 'string' && value.trim()) {
    return [value]
  }

  return []
}

export function getJogoPlataformas(jogo) {
  return normalizePlataformas(jogo?.plataformas ?? jogo?.plataforma)
}

export function getJogoPlataformasLabels(jogo) {
  return getJogoPlataformas(jogo).map(getPlataformaLabel)
}

export function getJogoImageUrl(url) {
  if (!url || !String(url).trim()) return PLACEHOLDER_IMAGE
  return url.startsWith('http') ? url : `https:${url}`
}

export function getJogoSummary(summary) {
  if (!summary || !String(summary).trim()) return 'Resumo não disponível'
  return String(summary).trim()
}

export function getShortSummary(summary, max = 140) {
  const text = getJogoSummary(summary)
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}...`
}

export function getJogoRatingNumber(rating) {
  if (rating === null || rating === undefined || Number.isNaN(Number(rating))) {
    return null
  }

  return Number(rating)
}

export function getJogoRating(rating) {
  const value = getJogoRatingNumber(rating)
  if (value === null) return 'Sem nota'
  return value.toFixed(2)
}

export function getMediaReviewsNumber(media) {
  if (media === null || media === undefined || Number.isNaN(Number(media))) {
    return null
  }

  const value = Number(media)
  return value > 0 ? value : null
}

export function getMediaReviewsLabel(media) {
  const value = getMediaReviewsNumber(media)
  if (value === null) return 'Sem avaliações'
  return value.toFixed(1)
}

export function getCommunityRatingColor(media) {
  const value = getMediaReviewsNumber(media)
  if (value === null) return 'rgba(255,255,255,0.25)'
  if (value >= 7.5) return '#00ffaa'
  if (value >= 5) return '#ffc800'
  return '#ff3b5c'
}

export function getIgdbRatingColor(rating) {
  const value = getJogoRatingNumber(rating)
  if (value === null) return 'var(--text-muted)'
  if (value >= 80) return 'var(--neon)'
  if (value >= 60) return 'var(--gold)'
  return 'var(--accent)'
}

export function getIgdbRatingGlow(rating) {
  const value = getJogoRatingNumber(rating)
  if (value === null) return 'none'
  if (value >= 80) return '0 0 10px var(--neon-dim)'
  if (value >= 60) return '0 0 10px rgba(255,215,0,0.3)'
  return '0 0 10px var(--accent-dim)'
}

export function formatIgdbYear(unix) {
  if (!unix) return null
  return new Date(unix * 1000).getFullYear()
}