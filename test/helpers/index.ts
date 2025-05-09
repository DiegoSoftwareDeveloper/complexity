export const getRandomNumber = () => Math.ceil(Math.random() * 100)

export const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
})
