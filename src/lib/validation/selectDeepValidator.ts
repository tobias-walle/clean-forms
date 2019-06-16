import { getPathSegments, Path } from '../models/Path';
import { SelectDeepArgs } from '../utils/selectDeep';
import { ArrayValidation, ValidationDefinition, ValidationFunction } from './ValidationDefinition';

type ValidationDefintionValue<V> = V extends ValidationDefinition<infer T> ? T : never;

export function selectDeepValidator<V extends ValidationDefinition<any>>({
  object,
  path,
}: SelectDeepArgs<V, Path<ValidationDefintionValue<V>, any>>): ValidationFunction | undefined {
  const pathAsArray = getPathSegments(path);
  object = pathAsArray.reduce((item, key) => {
    if (item === undefined) {
      return;
    }
    if (item instanceof ArrayValidation) {
      return item.itemValidation;
    }
    return (item as any)[key];
  }, object);
  if (object instanceof ArrayValidation) {
    return object.arrayValidation;
  }
  return object as any;
}
