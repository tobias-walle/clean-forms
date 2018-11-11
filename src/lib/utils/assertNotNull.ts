export function assertNotNull<T>(value: T, message: string): Exclude<T, null | undefined> {
  if (value == null) {
    throw new Error(message);
  }
  return value as Exclude<T, null | undefined>;
}
