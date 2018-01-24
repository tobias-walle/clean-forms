import { assertPropertyInObject } from './assertPropertyInObject';

describe('assertPropertyInObject', () => {
  it('should throw an error if an object does not have an property', () => {
    const object = { a: 123};
    const property = 'b';

    expect(() => assertPropertyInObject(object, property)).toThrowErrorMatchingSnapshot();
  });

  it('should not throw an error if an object does have an property', () => {
    const object = { a: 123};
    const property = 'a';

    expect(() => assertPropertyInObject(object, property)).not.toThrowError();
  });
});
