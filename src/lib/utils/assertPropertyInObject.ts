export function assertPropertyInObject(object: any, key: keyof any): void {
  if (!object) {
    throw new TypeError(`Cannot find key "${String(key)}" in ${String(object)}`);
  }
  const objectHasKey = key in object;
  if (!objectHasKey) {
    throw new ReferenceError(`The key "${String(key)}" does not exits on item ${JSON.stringify(object)}.`);
  }
}
