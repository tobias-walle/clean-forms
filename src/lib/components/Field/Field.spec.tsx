import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { FormContext } from '../Form/Form';
import { renderInput } from '../InputField/InputField';
import { Field } from './Field';

describe('Field', () => {
  it('should render', () => {
    const field = <Field name={'name'} render={renderInput}/>;
    const context: FormContext<any> = {
      model: { name: 'value' },
      onValueChange: () => {
      },
    };
    expect(shallow(field, { context })).toMatchSnapshot();
  });

  it('should pass props', () => {
    const mockRender = jest.fn(renderInput);
    const name = 'name';
    const value = 'value';
    const type = 'number';
    const field = <Field name={name} render={mockRender} inner={{type}}/>;
    const context: FormContext<any> = {
      model: { [name]: value },
      onValueChange: () => {
      },
    };

    mount(field, { context });

    expect(mockRender).toBeCalledWith({
      input: {name, value, onChange: expect.any(Function)},
      custom: { type }
      }, {});
  });

  it('should trigger callback', () => {
    const name = 'name';
    const value = 'value';
    const onValueChange = jest.fn();
    const field = <Field name={name} render={renderInput}/>;
    const context: FormContext<any> = {
      model: { [name]: value },
      onValueChange,
    };
    const element = mount(field, { context });
    const wrapper = element.children().first();
    const onChange = wrapper.props().input.onChange;

    expect(onValueChange).not.toHaveBeenCalled();

    const newValue = 'newValue';
    onChange(newValue);

    expect(onValueChange).toHaveBeenCalledWith(name, newValue);
  });
});
