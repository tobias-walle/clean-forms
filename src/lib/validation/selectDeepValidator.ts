import { SelectDeepArgs } from '../utils/selectDeep';
import { transformPathToArray } from '../utils/transformPathToArray';
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
