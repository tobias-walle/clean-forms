import { Path } from './FieldRegister';
import { transformPathToArray } from './transformPathToArray';

export function getPathHead(path: Path): string {
  const pathAsArray = transformPathToArray(path);
  const isEmpty = pathAsArray.length === 0;
  if (isEmpty) {
    throw new ReferenceError('Path is empty');
  }
  const lastIndex = pathAsArray.length - 1;
  return pathAsArray[lastIndex];
}

export function getPathHeadAsNumber(path: Path): number {
  const pathHead = getPathHead(path);
  const pathHeadAsNumber = Number(pathHead);
  if (isNaN(pathHeadAsNumber)) {
    throw new Error(`Cannot convert the path head "${pathHead}" to a number`);
  }
  return pathHeadAsNumber;
}
