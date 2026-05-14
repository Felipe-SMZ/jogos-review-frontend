export function extractErrorMsg(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.erro ||
    error?.message ||
    'Ocorreu um erro inesperado.'
  )
}