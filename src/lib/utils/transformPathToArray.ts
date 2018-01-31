export function transformPathToArray(path: string): string[] {
  if (!path) {
    return [];
  }
  return path.split('.');
}
