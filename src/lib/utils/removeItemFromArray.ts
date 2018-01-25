export function removeItemFromArray<T>(array: T[], item: T): void {
  const index = array.indexOf(item);
  array.splice(index, 1);
}
