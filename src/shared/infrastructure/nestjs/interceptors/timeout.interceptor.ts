import { RequestTimeoutException, CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { catchError, throwError, timeout, TimeoutError } from 'rxjs'

export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      timeout(5000),
      catchError((err) => throwError(err instanceof TimeoutError ? new RequestTimeoutException() : err)),
    )
  }
}
