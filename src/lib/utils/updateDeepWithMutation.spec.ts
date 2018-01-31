import { updateDeepWithMutation } from './updateDeepWithMutation';

describe('updateDeepWithMutation', () => {
  it('should update an object', () => {
    const object = {
      a: { b: { c: 0 } }
    };

    updateDeepWithMutation({ object, path: ['a', 'b', 'c'], value: 1 });

    expect(object).toEqual({ a: { b: { c: 1 } } });
  });

  it('should update an flat object', () => {
    const object = {
      a: 0
    };

    updateDeepWithMutation({ object, path: ['a'], value: 0 });

    expect(object).toEqual({ a: 0 });
  });

  it('should update an object if the updated keys do not exist', () => {
    const object = {};

    updateDeepWithMutation({ object, path: ['a', 'b', 'c'], value: 1 });

    expect(object).toEqual({ a: { b: { c: 1 } } });
  });

  it('should use "getNext" to change the update behaviour', () => {
    const object = { a: { children: { b: { children: { c: 0 } } } } };

    updateDeepWithMutation({
      object,
      path: ['a', 'b', 'c'],
      value: 1,
      getNext: obj => (obj.children || obj),
    });

    expect(object).toEqual({ a: { children: { b: { children: { c: 1 } } } } });
  });
});
