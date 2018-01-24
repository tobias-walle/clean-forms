import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { InputField } from '../';
import { FieldGroupContext } from '../FieldGroup/FieldGroup';
import { FormContext, OnValueChange } from '../Form/Form';
import { FieldArrayItems } from './FieldArrayItems';

describe('FieldArrayItems', () => {
  it('should render items', () => {
    const data = {
      array: [
        { a: 0 },
        { a: 1 },
        { a: 2 },
      ]
    };
    const context: FormContext<typeof data> & FieldGroupContext = {
      model: data,
      onValueChange: () => {
      },
      groups: ['array']
    };
    const element = mount(
      <FieldArrayItems
        getKey={(_, i) => i}
        render={() => (
          <InputField name={'a'}/>
        )}/>
      , { context }
    );

    expect(element).toMatchSnapshot();
    expect(element.find(InputField).length).toBe(3);
  });

  it('should pass remove callback to render function', () => {
    const data = {
      array: [
        { a: 0 },
        { a: 1 },
        { a: 2 },
      ]
    };
    type Model = typeof data;
    const onValueChange: OnValueChange<Model> = jest.fn();
    const context: FormContext<Model> & FieldGroupContext = {
      model: data,
      onValueChange,
      groups: ['array']
    };
    const element = mount(
      <FieldArrayItems
        getKey={(_, i) => i}
        render={({remove}) => (
          <div>
            <InputField name={'a'}/>
            <button onClick={remove}>Remove</button>
          </div>
        )}/>
      , { context }
    );

    element.find('button').first().simulate('click');

    expect(onValueChange).toHaveBeenCalledWith(['array'], [{a: 1}, {a: 2}]);
  });
});
