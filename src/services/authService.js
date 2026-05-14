import api from './api'

export const login = (email, senha) =>
  api.post('/auth/login', { email, senha })

export const registrar = (email, nickname, senha) =>
  api.post('/auth/registrar', { email, nickname, senha })
