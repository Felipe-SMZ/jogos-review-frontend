import api from './api'

export const buscarReviewsPorJogo = (jogoId, params = {}) => {
  return api.get(`/jogos/${jogoId}/reviews`, { params })
}

export const criarReview = (jogoId, payload) => {
  return api.post(`/jogos/${jogoId}/reviews`, payload)
}

export const editarReview = (reviewId, payload) => {
  return api.put(`/reviews/${reviewId}`, payload)
}

export const deletarReview = (reviewId) => {
  return api.delete(`/reviews/${reviewId}`)
}