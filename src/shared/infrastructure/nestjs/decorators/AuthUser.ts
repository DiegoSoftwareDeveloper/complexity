import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface IJWT {
  _id: string
  role: string
}

export interface IAuthUser {
  _id?: string
  role?: string
}

export const AuthUser = createParamDecorator((data, ctx: ExecutionContext): IJWT => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})
