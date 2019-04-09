import { updateDeep } from './updateDeep';

/**
 * Set a value from an object by the given path and returns the new object
 */
export function setByPath<T>(
  object: T,
  path: string,
  value: any,
): T {
  return updateDeep({
    object,
    path,
    value,
    assert: false,
  });
}
