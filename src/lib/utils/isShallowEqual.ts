export function isShallowEqual(o1: any, o2: any): boolean {
  const o1Keys = Object.keys(o1);
  const o2Keys = Object.keys(o2);
  if (o1Keys.length !== o2Keys.length) {
    return false;
  }
  for (const key of o1Keys) {
    if (o1[key] !== o2[key]) {
      return false;
    }
  }
  return true;
}
