// import {
//   registerDecorator,
//   ValidationArguments,
//   ValidationOptions,
//   ValidatorConstraint,
//   ValidatorConstraintInterface,
// } from 'class-validator';
// import { DynamicFactoryService } from '../../domain/services/dynamic-factory.service';
// import { Injectable } from '@nestjs/common';
//
// export function IsUnique(
//   repository: string,
//   field: string,
//   validationOptions?: ValidationOptions,
// ) {
//   return (object: any, propertyName: string) => {
//     registerDecorator({
//       target: object.constructor,
//       propertyName,
//       options: validationOptions,
//       constraints: [repository, field],
//       validator: isUniqueValidator,
//     });
//   };
// }
//
// @ValidatorConstraint({ name: 'IsUnique', async: true })
// @Injectable()
// export class isUniqueValidator implements ValidatorConstraintInterface {
//   constructor(private readonly _dynamicFactoryService: DynamicFactoryService) {}
//
//   async validate(value: any, validationArguments: ValidationArguments) {
//     const [repositoryName, field] = validationArguments.constraints;
//     const repository = this._dynamicFactoryService.get(repositoryName);
//
//     const [result] = await repository.findOne({
//       [field]: value,
//     });
//
//     return !Boolean(result);
//   }
//
//   defaultMessage(validationArguments?: ValidationArguments): string {
//     const [repositoryName, field] = validationArguments.constraints;
//     return `A ${field} already exists in the ${repositoryName}`;
//   }
// }
