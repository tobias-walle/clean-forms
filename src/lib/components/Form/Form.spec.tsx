import { mount, ReactWrapper, shallow } from 'enzyme';
import * as React from 'react';
import { InputField } from '../InputField/InputField';
import { Form } from './Form';

describe('Form', () => {
  it('should render', () => {
    expect(shallow(<Form model={{}}/>)).toMatchSnapshot();
  });

  it('should render model in inputs', () => {
    const model = {
      a: 'hello',
      b: 124
    };
    const element = mount(
      <Form model={model}>
        <InputField name={'a'}/>
        <InputField name={'b'} inner={{
          type: 'number'
        }}/>
      </Form>
    );
    const inputs = element.find('input');
    const firstInputProps = inputs.first().props();
    const secondInputProps = inputs.at(1).props();

    expect(firstInputProps.name).toBe('a');
    expect(firstInputProps.value).toBe('hello');
    expect(secondInputProps.name).toBe('b');
    expect(secondInputProps.value).toBe(124);
    expect(secondInputProps.type).toBe('number');
    expect(element.html()).toMatchSnapshot();
  });

  it('should emit model changes', () => {
    const onChange = jest.fn();
    const model = {
      a: 'hello',
      b: 124
    };
    const element = mount(
      <Form model={model} onChange={onChange}>
        <InputField name={'a'}/>
        <InputField name={'b'} inner={{
          type: 'number'
        }}/>
      </Form>
    );
    const expectedNewValue = 'new';
    const inputs = element.find('input');
    const firstInput = inputs.first();

    expect(onChange).not.toHaveBeenCalled();

    firstInput.simulate('change', { target: { value: expectedNewValue } });

    expect(onChange).toHaveBeenCalledWith({
      ...model,
      a: expectedNewValue
    });
  });
});
