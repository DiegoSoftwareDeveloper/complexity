import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

export function IsSameTo(property: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: isEqualToValidator,
    })
  }
}

@ValidatorConstraint({ name: 'IsSameTo' })
export class isEqualToValidator implements ValidatorConstraintInterface {
  validate(value: any, validationArguments: ValidationArguments) {
    const [relatedPropertyName] = validationArguments.constraints
    const relatedValue = validationArguments.object[relatedPropertyName]
    return value === relatedValue
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const [constraintProperty] = validationArguments.constraints
    return `${constraintProperty} and ${validationArguments.property} is not the same`
  }
}
