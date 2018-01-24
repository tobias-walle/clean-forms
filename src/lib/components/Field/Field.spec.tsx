import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { FieldGroupContext } from '../FieldGroup/FieldGroup';
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
    const field = <Field name={name} render={mockRender} inner={{ type }}/>;
    const context: FormContext<any> = {
      model: { [name]: value },
      onValueChange: () => {
      },
    };

    mount(field, { context });

    expect(mockRender).toBeCalledWith({
      input: { name, value, onChange: expect.any(Function) },
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

    expect(onValueChange).toHaveBeenCalledWith([name], newValue);
  });

  it('should support grouping', () => {
    const context: FormContext<any> & FieldGroupContext = {
      model: { testGroup1: { testGroup2: { name: 'value' } } },
      onValueChange: () => {
      },
      groups: ['testGroup1', 'testGroup2']
    };
    const element = mount(
      <Field name={'name'} render={renderInput}/>
    , { context });

    const input = element.find('input');
    expect(input.props().value).toBe('value');
  });

  it('should support null as name', () => {
    const context: FormContext<any> & FieldGroupContext = {
      model: { testGroup1: { testGroup2: 'value' } },
      onValueChange: () => {
      },
      groups: ['testGroup1', 'testGroup2']
    };
    const element = mount(
      <Field name={null} render={renderInput}/>
    , { context });

    const input = element.find('input');
    expect(input.props().value).toBe('value');
  });

  it('should trigger callback in group', () => {
    const name = 'name';
    const value = 'value';
    const onValueChange = jest.fn();
    const field = <Field name={name} render={renderInput}/>;
    const context: FormContext<any> & FieldGroupContext = {
      model: { group1: { group2: { [name]: value } }},
      onValueChange,
      groups: ['group1', 'group2']
    };
    const element = mount(field, { context });
    const wrapper = element.children().first();
    const onChange = wrapper.props().input.onChange;

    expect(onValueChange).not.toHaveBeenCalled();

    const newValue = 'newValue';
    onChange(newValue);

    expect(onValueChange).toHaveBeenCalledWith(['group1', 'group2', name], newValue);
  });
});
