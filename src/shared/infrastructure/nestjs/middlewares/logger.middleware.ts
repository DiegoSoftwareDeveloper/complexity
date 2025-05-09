import { Request, Response, NextFunction } from 'express'

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const { ip, method, baseUrl } = req
  const userAgent = req.get('user-agent') || ''

  res.on('close', () => {
    const { statusCode } = res
    const timestamp = new Date().toISOString()

    const message = `${timestamp}, method: ${method}, baseUrl: ${baseUrl}, statusCode: ${statusCode}, userAgent: ${userAgent}, ip: ${ip}`

    if (statusCode >= 500) {
      console.error(message)
    } else if (statusCode >= 400) {
      console.warn(message)
    } else {
      console.log(message)
    }
  })

  next()
}
