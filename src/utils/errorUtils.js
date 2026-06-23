export function extractErrorMsg(error) {
  const status = error?.response?.status
  const apiMessage = error?.response?.data?.message || error?.response?.data?.erro

  if (status === 400 && apiMessage) return apiMessage
  if (status === 401) return 'Sua sessão é inválida ou expirou.'
  if (status === 403) return 'Você não tem permissão para executar esta ação.'
  if (status === 404) return 'O recurso solicitado não foi encontrado.'
  if (status === 409 && apiMessage) return apiMessage
  if (status === 422 && apiMessage) return apiMessage
  if (status >= 500) return 'Erro interno do servidor. Tente novamente mais tarde.'

  return apiMessage && apiMessage.length <= 180
    ? apiMessage
    : 'Ocorreu um erro inesperado.'
}