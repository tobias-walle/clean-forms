export function createPath(parentPath: string | undefined, name: string | number | null): string {
  let result = parentPath ? [parentPath] : [];
  if (name != null) {
    result = [...result, String(name)];
  }
  return result.join('.');
}
