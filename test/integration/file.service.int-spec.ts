import { Test } from '@nestjs/testing'

import { ConfigModule, ConfigService } from '@nestjs/config'
import { FilesService } from '../../src/files/application/files.service'

import { FilesSystemRepositoryDomain } from '../../src/files/domain/repositories/files-system.repository.domain'
import { FilesRepositoryDomain } from '../../src/files/domain/repositories/files.repository.domain'
import { FilesMongoRepository } from '../../src/files/infrastructure/mongoose/repositories/files.repository.mongoose'
import { FilesS3Repository } from '../../src/files/infrastructure/s3/files-s3.repository'
import { FileEntity } from '../../src/files/domain/entities/files.entity'
import { SharedModule } from '../../src/shared/shared.module'
import { MongooseModule } from '@nestjs/mongoose'
import { FileSchema } from '../../src/files/infrastructure/mongoose/schema/file.schema.mongoose'
import { envLoader } from '../../src/shared/infrastructure/nestjs/env/env-loader'

jest.setTimeout(30000)

const generateBuffer = (size: number) => {
  const mb = size * 1024 * 1024
  return Buffer.from('x'.repeat(mb), 'utf8')
}

describe('fileService (int)', () => {
  let fileService: FilesService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: envLoader(),
          cache: true,
          // validate,
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get('DB_MONGO'),
          }),
        }),
        SharedModule,
        MongooseModule.forFeature([
          { name: File.name, schema: FileSchema },
          // { name: InformativeFile.name, schema: InformativeFileSchema },
        ]),
      ],
      providers: [
        FilesService,
        {
          provide: FilesRepositoryDomain,
          useClass: FilesMongoRepository,
        },
        {
          provide: FilesSystemRepositoryDomain,
          useClass: FilesS3Repository,
        },
      ],
    }).compile()

    fileService = moduleRef.get<FilesService>(FilesService)
  })

  it('fileService UploadFile should be success', async () => {
    const fileUpload = new FileEntity({
      _id: 'uploadFile',
      buffer: generateBuffer(1),
    })

    const result = await fileService.uploadFile({ file: fileUpload })
    expect(result).toBeTruthy()
    const resultDelete = await fileService.deleteFile({ id: fileUpload._id })
    expect(resultDelete).toBeTruthy()
  })

  it('fileService DeleteFile should be success', async () => {
    const fileDelete = new FileEntity({
      _id: 'deleteFile',
      buffer: generateBuffer(1),
    })
    const result = await fileService.uploadFile({ file: fileDelete })
    expect(result).toBeTruthy()
    const resultDelete = await fileService.deleteFile({ id: fileDelete._id })
    expect(resultDelete).toBeTruthy()
  })

  afterAll(async () => {
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })
})
