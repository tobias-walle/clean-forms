export function assertPropertyInObject(object: any, key: string): void {
  if (!object) {
    throw new TypeError(`Cannot find key "${key}" in ${String(object)}`);
  }
  const objectHasKey = key in object;
  if (!objectHasKey) {
    throw new ReferenceError(`The key "${key}" does not exits on item ${JSON.stringify(object)}.`);
  }
}
