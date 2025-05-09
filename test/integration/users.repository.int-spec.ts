// import { Test, TestingModule } from '@nestjs/testing'

// import { ConfigModule, ConfigService } from '@nestjs/config'
// import { MongooseModule } from '@nestjs/mongoose'
// import {
//   UserSchemaBaseMongoose,
//   UserSchemaMongoose,
// } from '../../src/users/infrastructure/mongoose/schemas/user.schema.mongoose'
// import { UserEntity } from '../../src/users/domain/entities/user.domain'
// import { UsersRepositoryMongoose } from '../../src/users/infrastructure/mongoose/repositories/users.repository.mongoose'

// jest.setTimeout(1000 * 1000)

// describe('UsersRepository (int)', () => {
//   let userRepository: UsersRepositoryMongoose
//   let moduleRef: TestingModule

//   beforeEach(async () => {
//     moduleRef = await Test.createTestingModule({
//       imports: [
//         ConfigModule.forRoot({
//           isGlobal: true,
//           envFilePath: ['local.env'],
//         }),
//         MongooseModule.forRootAsync({
//           imports: [ConfigModule],
//           inject: [ConfigService],
//           useFactory: async (configService: ConfigService) => ({
//             uri: configService.get('MONGO_DB'),
//           }),
//         }),
//         MongooseModule.forFeature([{ name: UserSchemaBaseMongoose.name, schema: UserSchemaMongoose }]),
//       ],
//       providers: [UsersRepositoryMongoose],
//     }).compile()

//     userRepository = moduleRef.get<UsersRepositoryMongoose>(UsersRepositoryMongoose)
//   })

//   it('findPaginate its working', async () => {
//     const [r, e] = await userRepository.base.findPaginate<UserEntity>()
//     console.log(r)
//     expect(e).toBeNull()
//   })

//   it('aggregatePaginate its working', async () => {
//     const [r, e] = await userRepository.base.aggregatePaginate<UserEntity>()
//     console.log(r)
//     expect(e).toBeNull()
//   })

//   // it('usersJoinCityAndState its working', async () => {
//   //   const [r, e] = await userRepository.usersJoinCityAndState()
//   //   console.log(r)
//   //   expect(e).toBeNull()
//   // })

//   afterEach(async () => {
//     await moduleRef.close()
//   })
// })
