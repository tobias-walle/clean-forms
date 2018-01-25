import { assertPropertyInObject } from './assertPropertyInObject';

export interface SelectDeepArgs {
  object: any;
  path: string[];
  assert?: boolean;
}

export function selectDeep({object, path, assert = true}: SelectDeepArgs): any {
  return path.reduce((item, key: string) => {
    assert && assertPropertyInObject(item, key);
    if (item === undefined) {
      return;
    }
    return item[key];
  }, object);
}
