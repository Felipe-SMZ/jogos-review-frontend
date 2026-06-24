import api from './api'

const BASE_URL = '/jogos'

export const listarJogos = (params) => api.get(BASE_URL, { params })

export const buscarJogoPorId = (id) => api.get(`${BASE_URL}/${id}`)

export const criarJogo = (payload) => api.post(BASE_URL, payload)

export const editarJogo = (id, payload) => api.put(`${BASE_URL}/${id}`, payload)

export const deletarJogo = (id) => api.delete(`${BASE_URL}/${id}`)

export const mediaNotas = (id) => api.get(`${BASE_URL}/${id}/media`)