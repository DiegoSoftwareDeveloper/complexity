import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class NotEmptyPayloadPipe implements PipeTransform {
  transform(payload: unknown) {
    if (!payload || !Object.keys(payload).length) {
      throw new BadRequestException('Payload should not be empty.')
    }

    return payload
  }
}
