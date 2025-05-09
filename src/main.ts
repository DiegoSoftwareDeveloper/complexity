import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { useContainer } from 'class-validator'
import { TimeoutInterceptor } from './shared/infrastructure/nestjs/interceptors/timeout.interceptor'
import { HttpExceptionFilter } from './shared/infrastructure/nestjs/exceptions/http-exception.filter'
import * as compression from 'compression'
import { loggerMiddleware } from './shared/infrastructure/nestjs/middlewares/logger.middleware'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  })

  // allow injectable in all application
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
          scriptSrc: ["'self'", "https: 'unsafe-inline'"],
          objectSrc: ["'none'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          connectSrc: ["'self'", 'https:'],
        },
      },
      ieNoOpen: true,
      noSniff: true,
      dnsPrefetchControl: {
        allow: false,
      },
      frameguard: {
        action: 'deny',
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: {
        policy: 'same-origin',
      },
      xssFilter: true,
    }),
  )

  app.use(compression())

  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  app.useGlobalInterceptors(new TimeoutInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())

  // middleware logger
  app.use(loggerMiddleware)

  const config = new DocumentBuilder()
    .setTitle('core')
    .setDescription('OAS documentation')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      filter: true,
    },
  })

  await app.listen(process.env.PORT)
  console.log(`Application is running on ${await app.getUrl()}`)
}

bootstrap()
