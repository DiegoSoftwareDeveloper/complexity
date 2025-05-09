import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { MessagesEntity } from '../../domain/entities/message-shared.entity'

@Injectable()
export class UtilsSharedService {
  checkErrDatabaseThrowErr(arg: { err: Error }) {
    const { err } = arg
    if (err) {
      throw new InternalServerErrorException(MessagesEntity.ERR_DATABASE)
    }
  }

  checkErrFileSystemThrowErr(arg: { err: Error }) {
    const { err } = arg
    if (err) {
      throw new InternalServerErrorException(MessagesEntity.ERR_FILE_SYSTEM)
    }
  }

  checkErrIdNotFoundThrowErr(arg: { result: any }) {
    const { result } = arg
    if (!result) {
      throw new NotFoundException(MessagesEntity.ERR_ID_NOT_FOUND)
    }
  }

  checkErrIdAlReadyFoundThrowErr(arg: { result: any }) {
    const { result } = arg
    if (result) {
      throw new BadRequestException(MessagesEntity.ERR_ID_ALREADY_EXISTS)
    }
  }

  checkErrFieldAlReadyFoundThrowErr(arg: { result: any; field: string }) {
    const { field, result } = arg
    if (result) {
      throw new BadRequestException(MessagesEntity.genErrFieldAlreadyExist(field))
    }
  }
}
