import { ArrayValidation, ValidationResolver } from './ValidationDefinition';

export function isValidationResolver(item: any): item is ValidationResolver<unknown> {
  return item instanceof ArrayValidation || typeof item === 'function';
}
