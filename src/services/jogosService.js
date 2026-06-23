import api from './api'

export const listarJogos = (params = {}) => {
  return api.get('/jogos', { params })
}

export const buscarJogoPorId = (id) => {
  return api.get(`/jogos/${id}`)
}

export const criarJogo = (payload) => {
  return api.post('/admin/jogos', payload)
}

export const editarJogo = (id, payload) => {
  return api.put(`/admin/jogos/${id}`, payload)
}

export const deletarJogo = (id) => {
  return api.delete(`/admin/jogos/${id}`)
}

export const mediaNotas = (id) => {
  return api.get(`/reviews/jogo/${id}/media`)
}