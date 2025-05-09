import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { isValidObjectIdDomain } from '../../../domain/entities/validatorId.domain'

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string) {
    if (!isValidObjectIdDomain(value)) {
      throw new BadRequestException('Incorrect ObjectID')
    }
    return value
  }
}
