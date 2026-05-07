import api from './api'

export const listarReviews = (jogoId, params = {}) =>
  api.get(`/jogos/${jogoId}/reviews`, { params })

export const criarReview = (jogoId, data) =>
  api.post(`/jogos/${jogoId}/reviews`, data)

export const editarReview = (reviewId, data) =>
  api.put(`/reviews/${reviewId}`, data)

export const deletarReview = (reviewId) =>
  api.delete(`/reviews/${reviewId}`)
