export function createPath(groups: string[] | undefined, name: string | null) {
  let result = groups || [];
  if (name) {
    result = [...result, name];
  }
  return result;
}
