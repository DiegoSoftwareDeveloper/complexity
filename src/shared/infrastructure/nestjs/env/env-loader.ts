export const envLoader = (): string[] => {
  if (process.env.NODE_ENV === 'testing') {
    return ['testing.env']
  }

  return ['local.env', 'development.env', '.env']
}
