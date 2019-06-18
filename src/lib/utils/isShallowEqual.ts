export function isShallowEqual(o1: any, o2: any, debug: boolean = false): boolean {
  if (oneIsNull(o1, o2)) {
    return compareIfOneIsNull(o1, o2);
  }
  const o1Keys = Object.keys(o1);
  const o2Keys = Object.keys(o2);
  if (o1Keys.length !== o2Keys.length) {
    return false;
  }
  for (const key of o1Keys) {
    if (o1[key] !== o2[key]) {
      if (debug) {
        console.info(key, o1[key], o2[key], o1);
      }
      return false;
    }
  }
  return true;
}

export function arePropertiesShallowEqual<T, O>(keys: Array<keyof T | keyof O>, o1: T, o2: O): boolean {
  if (oneIsNull(o1, o2)) {
    return compareIfOneIsNull(o1, o2);
  }
  return keys.every(key => isShallowEqual((o1 as any)[key], (o2 as any)[key as any]));
}

function oneIsNull(o1: any, o2: any): boolean {
  return o1 == null || o2 == null;
}

function compareIfOneIsNull(o1: any, o2: any): boolean {
  if (o1 == null && o2 != null) {
    return false;
  }
  if (o2 == null && o1 != null) {
    return false;
  }
  return true;
}
