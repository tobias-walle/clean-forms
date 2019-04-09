import { selectDeep } from './selectDeep';

/**
 * Get a value from an object by the given path.
 * For example, the path 'a.b' on the object { a: { b: 1 } } would return 1.
 * If the path is not found, undefined will be returned
 */
export function getByPath<R = unknown>(object: object, path: string): R | undefined {
  return selectDeep({
    object,
    path,
    assert: false
  });
}
