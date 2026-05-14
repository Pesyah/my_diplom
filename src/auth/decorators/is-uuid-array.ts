import {
  isUUID,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsUUIDArray(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUUIDArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return (
            Array.isArray(value) &&
            value.every((item) => typeof item === 'string' && isUUID(item))
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be an array of UUIDs`;
        },
      },
    });
  };
}