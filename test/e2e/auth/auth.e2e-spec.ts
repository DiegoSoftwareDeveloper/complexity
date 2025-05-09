import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../../src/app.module'
import { UsersRepositoryDomain } from '../../../src/users/domain/repository/users.repository.domain'
import { UserEntity } from '../../../src/users/domain/entities/user.domain'
import { Types } from 'mongoose'
import { faker } from '@faker-js/faker/.'
import { UserRoles } from '../../../src/users/domain/entities/user-roles.interface'

import '../shared-helpers/set-timeout'

const endpoint = '/api/auth'

const userDomain = new UserEntity({
  _id: new Types.UUID().toString(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  isBlocked: false,
  role: faker.helpers.enumValue(UserRoles),
})

describe('Test auth (e2e)', () => {
  let app: INestApplication
  let module: TestingModule
  let usersRepository: UsersRepositoryDomain

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()

    usersRepository = module.get<UsersRepositoryDomain>(UsersRepositoryDomain)
  })

  afterAll(async () => {
    await app?.close()
  })

  it(`${endpoint}/register (POST)`, async () => {
    await usersRepository.base.deleteById(userDomain._id)

    const response = await request(app.getHttpServer()).post(`${endpoint}/register`).send(userDomain)

    expect(response.status).toBe(201)

    // reset database
    await usersRepository.base.deleteById(userDomain._id)
  })

  it(`${endpoint}/login (POST) login`, async () => {
    await usersRepository.base.deleteById(userDomain._id)
    await usersRepository.base.create(userDomain)

    const credentials = {
      email: userDomain.email,
      password: userDomain.password,
    }

    const response = await request(app.getHttpServer()).post(`${endpoint}/login`).send(credentials)

    expect(response.status).toBe(200)
    await usersRepository.base.deleteById(userDomain._id)
  })
})
