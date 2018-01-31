import { Path } from './FieldRegister';
import { getParentPath } from './getParentPath';

export type GetNext = (object: any) => any;

export interface UpdateDeepWithMutationArguments {
  object: any;
  path: Path;
  value: any;
  getNext?: GetNext;
}

/**
 * Like the "updateDeep" Function, but this function will mutate the given object to save performance
 */
export function updateDeepWithMutation({
  object,
  path,
  value,
  getNext = obj => obj
}: UpdateDeepWithMutationArguments): void {
  const objectToUpdate = getObjectToUpdate(object, path, getNext);
  const keyToUpdate = getKeyToUpdate(path);
  objectToUpdate[keyToUpdate] = value;
}

function getObjectToUpdate(object: any, path: Path, getNext: GetNext): any {
  const parentPath = tryToGetParentPath(path);
  const result = parentPath.reduce((objectToUpdate, key) => {
    objectToUpdate = getNext(objectToUpdate);
    if (!objectToUpdate[key]) {
      objectToUpdate[key] = {};
    }
    return objectToUpdate[key];
  }, object);
  return getNext(result);
}

function tryToGetParentPath(path: Path): Path {
  try {
    return getParentPath(path);
  } catch (e) {
    return [];
  }
}

function getKeyToUpdate(path: Path): string {
  return path[path.length - 1];
}
