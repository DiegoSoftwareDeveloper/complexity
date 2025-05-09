import { UsersRepositoryDomain } from '../../../src/users/domain/repository/users.repository.domain'
import { UserRoles } from '../../../src/users/domain/entities/user-roles.interface'
import { UserEntity } from '../../../src/users/domain/entities/user.domain'
import { AuthService } from '../../../src/auth/application/services/auth.service'
import { TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { Types } from 'mongoose'

export const userDomain = new UserEntity({
  _id: new Types.UUID().toString(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  role: UserRoles.Admin,
  isBlocked: false,
})

export async function getAuthToken(arg: { module: TestingModule }): Promise<[string, () => Promise<void>]> {
  const { module } = arg
  const userRepository = module.get<UsersRepositoryDomain>(UsersRepositoryDomain)
  const authService = module.get<AuthService>(AuthService)

  await removeUserToken({ module, user: userDomain })
  await userRepository.base.create(userDomain)

  const response = await authService.login({ email: userDomain.email, password: userDomain.password })

  return [response.token, () => removeUserToken({ module, user: userDomain })]
}

export async function removeUserToken(arg: { module: TestingModule; user: UserEntity }) {
  const { module, user } = arg

  const userRepository = module.get<UsersRepositoryDomain>(UsersRepositoryDomain)

  await userRepository.base.deleteById(user._id)
}
