export function isYupSchema(value: any): value is import('yup').Schema<any> {
  try {
    const yup = require('yup');
    return yup.isSchema(value);
  } catch (err) {
    return false;
  }
}
