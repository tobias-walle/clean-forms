import { assertPropertyInObject } from './assertPropertyInObject';
import { transformPathToArray } from './transformPathToArray';

export type GetNext = (object: any) => any;

export interface SelectDeepArgs {
  object: any;
  path: string;
  assert?: boolean;
  getNext?: GetNext;
}

export function selectDeep({
  object,
  path,
  assert = true,
  getNext = obj => obj,
}: SelectDeepArgs): any {
  const pathAsArray = transformPathToArray(path);
  return pathAsArray.reduce((item, key: string) => {
    assert && assertPropertyInObject(item, key);
    if (item === undefined) {
      return;
    }
    return getNext(item[key]);
  }, getNext(object));
}
