import { assertPropertyInObject } from './assertPropertyInObject';
import { transformPathToArray } from './transformPathToArray';

export const DELETE = Symbol('DELETE');
export type DELETE = typeof DELETE;

export interface UpdateDeepArgs<T> {
  object: T;
  path: string;
  value: any | DELETE;
  assert?: boolean;
}

export function updateDeep<T>({object, path, value, assert = true}: UpdateDeepArgs<T>): T {
  const pathArray = transformPathToArray(path);
  if (pathArray.length <= 0) {
    throw new Error('The path cannot be empty');
  }
  const lastIndex = pathArray.length - 1;
  const tail = pathArray.slice(0, lastIndex);
  const keyToUpdate = pathArray[lastIndex];

  const { copy: result, selectedObject: objectToUpdate } = selectDeepAndCopy({
    object,
    path: tail,
    assert,
    createPropertyIfNotExists: value !== DELETE
  });
  assert && assertPropertyInObject(objectToUpdate, keyToUpdate);
  if (value === DELETE) {
    deleteProperty(objectToUpdate, keyToUpdate);
  } else {
    objectToUpdate[keyToUpdate] = value;
  }

  return result;
}

interface SelectDeepAndCopyArgs<T> {
  object: T;
  path: string[];
  assert?: boolean;
  createPropertyIfNotExists?: boolean;
}

function selectDeepAndCopy<T>({object, path, assert = true, createPropertyIfNotExists = true}: SelectDeepAndCopyArgs<T>): { copy: T, selectedObject: any } {
  path = path.slice(); // Copy the path
  const copy = copyArrayOrObject(object);

  const currentPath = [];
  let selectedObject: any = copy;
  while (path.length > 0) {
    const key = path.splice(0, 1)[0];
    currentPath.push(key);
    if (assert) {
      assertPropertyInObject(selectedObject, key);
    } else if (createPropertyIfNotExists) {
      ensurePropertyInObject(selectedObject, key);
    } else if (!(key in selectedObject)) {
      return { copy, selectedObject: {} };
    }
    if (typeof selectedObject[key] !== 'object') {
      throw new Error(`"${currentPath}" is not an object. Got ${selectedObject[key]} (${typeof selectedObject[key]}) instead.`);
    }

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

function ensurePropertyInObject(object: any, key: string): void {
  const objectHasKey = key in object;
  if (!objectHasKey) {
    object[key] = {};
  }
}

function deleteProperty(object: any, key: string): void {
  if (object instanceof Array) {
    object.splice(Number(key), 1);
  } else {
    delete object[key];
  }
}
