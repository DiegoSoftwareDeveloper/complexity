import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator'
import { Environment } from './environment.enum'

export class EnvironmentVariablesDto {
  @IsNumber()
  PORT: number

  @IsNotEmpty()
  @IsEnum(Environment)
  NODE_ENV: Environment

  @IsNotEmpty()
  CORS_ORIGIN: string

  @IsNotEmpty()
  APP_NAME: string

  @IsNotEmpty()
  APP_URL: string

  @IsNotEmpty()
  DB_MONGO: string
}
