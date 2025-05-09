import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

import { Types } from 'mongoose'

function isValidObjectId(id: string) {
  if (Types.ObjectId.isValid(id)) {
    if (String(new Types.ObjectId(id)) === id) return true
    return false
  }
  return false
}

@ValidatorConstraint({})
export class IsObjectIdValidator implements ValidatorConstraintInterface {
  // validate(objectId: any, args: ValidationArguments) {
  validate(objectId: any) {
    return isValidObjectId(objectId)
  }
  // defaultMessage(validationArguments?: ValidationArguments): string {
  defaultMessage(): string {
    return `$property no is objectId valid`
  }
}

export function IsObjectId(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isObjectId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsObjectIdValidator,
    })
  }
}
