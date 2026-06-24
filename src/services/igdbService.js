import api from './api'

/**
 * Busca jogos na IGDB pelo termo informado.
 * Endpoint: GET /admin/jogos/buscar?termoBusca={termo}
 * Requer ROLE_ADMIN (o interceptor do api.js injeta o token automaticamente).
 *
 * @param {string} termoBusca - Termo de busca (ex: "zelda", "god of war")
 * @returns {Promise}
 */
export const buscarJogosIgdb = (termoBusca) =>
  api.get('/admin/jogos/buscar', { params: { termoBusca } })

/**
 * Importa um jogo da IGDB para o sistema.
 * Endpoint: POST /admin/jogos/importar
 * Requer ROLE_ADMIN.
 *
 * @param {{ igdbId: number, genero: string, plataformas: string[] }} body
 * @returns {Promise}
 */
export const importarJogoIgdb = (body) =>
  api.post('/admin/jogos/importar', body)