import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger('HttpExceptionFilter')

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()

    // const isDevelopment = process.env.NODE_ENV === Environment.DEV

    // this.logger.error(
    //   `${request.method}, ${request.url}, ${JSON.stringify(exception.message) || ''}`,
    //   isDevelopment ? exception.stack : '',
    // )

    const exceptionResponse: object =
      typeof exception.getResponse() === 'string'
        ? { message: <string>exception.getResponse() }
        : <object>exception.getResponse()

    return response.status(status).json({
      request: {
        path: request.url,
        method: request.method,
      },
      ...exceptionResponse,
      statusCode: status,
      timestamp: new Date().toISOString(),
    })
  }
}
