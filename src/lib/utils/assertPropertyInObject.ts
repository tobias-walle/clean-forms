export function assertPropertyInObject(object: any, key: string): void {
  const objectHasKey = key in object;
  if (!objectHasKey) {
    throw new ReferenceError(`The key "${key}" does not exits on item ${JSON.stringify(object)}.`);
  }
}
