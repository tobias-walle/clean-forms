export function required(value: any) {
  if (value == null || value === '') {
    return 'Required';
  }
  return null;
}
