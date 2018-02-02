import { SelectDeepArgs } from '../selectDeep';
import { transformPathToArray } from '../transformPathToArray';
import { ArrayValidation, ValidationFunction } from './ValidationDefinition';

export function selectDeepValidator({ object, path }: SelectDeepArgs): ValidationFunction | undefined {
  const pathAsArray = transformPathToArray(path);
  object = pathAsArray.reduce((item, key: string) => {
    if (item === undefined) {
      return;
    }
    if (item instanceof ArrayValidation) {
      return item.itemValidation;
    }
    return item[key];
  }, object);
  if (object instanceof ArrayValidation) {
    return object.arrayValidation;
  }
  return object;
}
