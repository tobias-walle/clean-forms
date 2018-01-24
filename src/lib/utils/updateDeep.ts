import { assertPropertyInObject } from './assertPropertyInObject';

export function updateDeep<T>(object: T, path: string[], value: any): T {
  if (path.length <= 0) {
    throw new Error('The path cannot be empty');
  }
  const lastIndex = path.length - 1;
  const tail = path.slice(0, lastIndex);
  const keyToUpdate = path[lastIndex];

  const { copy: result, selectedObject: objectToUpdate } = selectDeepAndCopy(object, tail);
  assertPropertyInObject(objectToUpdate, keyToUpdate);
  objectToUpdate[keyToUpdate] = value;

  return result;
}

function selectDeepAndCopy<T>(object: T, path: string[]): { copy: T, selectedObject: any } {
  path = path.slice(); // Copy the path
  const copy = copyArrayOrObject(object);

  let selectedObject: any = copy;
  while (path.length > 0) {
    const key = path.splice(0, 1)[0];
    assertPropertyInObject(selectedObject, key);

    const lastObject = selectedObject;
    selectedObject = copyArrayOrObject(selectedObject[key]);
    lastObject[key] = selectedObject;
  }

  return { copy, selectedObject };
}

function copyArrayOrObject<T>(object: T): T {
  if (object instanceof Array) {
    return object.slice() as any;
  } else {
    return Object.assign({}, object);
  }
}
