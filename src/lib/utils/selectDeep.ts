import { assertPropertyInObject } from './assertPropertyInObject';

export function selectDeep(object: any, path: string[]): any {
  return path.reduce((item, key: string) => {
    assertPropertyInObject(item, key);
    return item[key];
  }, object);
}
