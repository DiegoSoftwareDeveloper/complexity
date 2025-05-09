import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../../src/app.module'
import { getAuthToken } from '../shared-helpers/auth-helper-test'
import { Types } from 'mongoose'
import { faker } from '@faker-js/faker'
import { UserEntity } from '../../../src/users/domain/entities/user.domain'
import { UserRoles } from '../../../src/users/domain/entities/user-roles.interface'
import { UsersRepositoryDomain } from '../../../src/users/domain/repository/users.repository.domain'

import '../shared-helpers/set-timeout'

const endpoint = '/api/users'

const userDomain = new UserEntity({
  _id: new Types.UUID().toString(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  isBlocked: false,
  role: faker.helpers.enumValue(UserRoles),
})

describe('Test users (e2e)', () => {
  let app: INestApplication
  let token: string
  let removeUserToken: () => Promise<void>
  let usersRepository: UsersRepositoryDomain
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()

    usersRepository = module.get<UsersRepositoryDomain>(UsersRepositoryDomain)

    const result = await getAuthToken({ module })

    token = result[0]
    removeUserToken = result[1]
  })

  afterAll(async () => {
    await removeUserToken()
    await app?.close()
  })

  it(`POST ${endpoint} - Successfully creates a user and returns 201`, async () => {
    await usersRepository.base.deleteById(userDomain._id)

    const response = await request(app.getHttpServer())
      .post(endpoint)
      .set('Authorization', `Bearer ${token}`)
      .send(userDomain)

    expect(response.status).toBe(201)

    // reset database
    await usersRepository.base.deleteById(userDomain._id)
  })

  it(`GET ${endpoint} - Successfully gets all users and returns status 200`, async () => {
    await usersRepository.base.deleteById(userDomain._id)
    await usersRepository.base.create(userDomain)

    const response = await request(app.getHttpServer())
      .get(`${endpoint}/?page=1&limit=10&quick-search=${userDomain.email}`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(response.status).toBe(200)

    // reset database
    await usersRepository.base.deleteById(userDomain._id)
  })

  it(`GET ${endpoint}/${userDomain._id} - Successfully gets a user by id and returns status 200`, async () => {
    await usersRepository.base.deleteById(userDomain._id)
    await usersRepository.base.create(userDomain)

    const response = await request(app.getHttpServer())
      .get(`${endpoint}/${userDomain._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(response.status).toBe(200)

    // reset database
    await usersRepository.base.deleteById(userDomain._id)
  })

  it(`PUT ${endpoint}/${userDomain._id} - Successfully updates a user and returns 200`, async () => {
    await usersRepository.base.deleteById(userDomain._id)
    await usersRepository.base.create(userDomain)

    const userUpdated = new UserEntity({
      _id: new Types.UUID().toString(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      isBlocked: true,
      role: faker.helpers.enumValue(UserRoles),
    })

    const response = await request(app.getHttpServer())
      .put(`${endpoint}/${userDomain._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(userUpdated)

    expect(response.status).toBe(200)

    // reset database
    await usersRepository.base.deleteById(userDomain._id)
  })

  it(`DELETE ${endpoint}/${userDomain._id} - Successfully deletes a user by ID and returns status 200`, async () => {
    await usersRepository.base.deleteById(userDomain._id)
    await usersRepository.base.create(userDomain)

    const response = await request(app.getHttpServer())
      .delete(`${endpoint}/${userDomain._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(response.status).toBe(200)

    // reset database
    await usersRepository.base.deleteById(userDomain._id)
  })
})
