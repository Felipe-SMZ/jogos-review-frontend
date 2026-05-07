import api from './api'

export const listarJogos = (params = {}) =>
  api.get('/jogos', { params })

export const buscarJogo = (id) =>
  api.get(`/jogos/${id}`)

export const criarJogo = (data) =>
  api.post('/jogos', data)

export const editarJogo = (id, data) =>
  api.put(`/jogos/${id}`, data)

export const deletarJogo = (id) =>
  api.delete(`/jogos/${id}`)

export const mediaNotas = (id) =>
  api.get(`/jogos/${id}/media`)
