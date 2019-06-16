import { getPathSegments, Path, PathValue } from '../models/Path';
import { assertPropertyInObject } from './assertPropertyInObject';

export type GetNext = (object: any) => any;

export interface SelectDeepArgs<T, P extends Path<T, any>> {
  object: T;
  path: P;
  assert?: boolean;
  getNext?: GetNext;
}

export function selectDeep<T, P extends Path<T, any>>({
  object,
  path,
  assert = true,
  getNext = obj => obj,
}: SelectDeepArgs<T, P>): PathValue<P> {
  const pathAsArray = getPathSegments(path);
  return pathAsArray.reduce((item, key) => {
    assert && assertPropertyInObject(item, key);
    if (item === undefined) {
      return;
    }
    return getNext(item[key]);
  }, getNext(object));
}
