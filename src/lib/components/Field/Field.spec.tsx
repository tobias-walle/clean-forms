import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { mockEvent } from '../../../testUtils/mockEvent';
import { mockFormContext } from '../../../testUtils/mockFormContext';
import { FieldGroupContext } from '../FieldGroup/FieldGroup';
import { FormContext } from '../Form/Form';
import { renderInput } from '../InputField/InputField';
import { Field, InnerFieldProps } from './Field';

describe('Field', () => {
  it('should render', () => {
    const field = <Field name={'name'} render={renderInput}/>;
    const model = { name: 'value' };
    const context: FormContext<any> = mockFormContext(model);
    expect(shallow(field, { context })).toMatchSnapshot();
  });

  it('should pass props', () => {
    const mockRender = jest.fn(renderInput);
    const name = 'name';
    const value = 'value';
    const type = 'number';
    const field = <Field name={name} render={mockRender} inner={{ type }}/>;
    const model = { [name]: value };
    const context = mockFormContext(model);

    mount(field, { context });

    const expectedInput: InnerFieldProps<any, any> = {
      input: {
        name, value,
        onChange: expect.any(Function),
        onFocus: expect.any(Function),
        onBlur: expect.any(Function),
      },
      custom: { type },
      form: context.form
    };
    expect(mockRender).toBeCalledWith(expectedInput);
  });

  it('should trigger onFieldChange', () => {
    const name = 'name';
    const value = 'value';
    const onFieldChange = jest.fn();
    const field = <Field name={name} render={renderInput}/>;
    const model = { [name]: value };
    const context = mockFormContext(model, { onFieldChange });

    const element = mount(field, { context });
    const wrapper = element.find('input');
    const onChange = wrapper.props().onChange;

    expect(onFieldChange).not.toHaveBeenCalled();

    const newValue = 'newValue';
    onChange!(mockEvent(newValue));

    expect(onFieldChange).toHaveBeenCalledWith([name], newValue);
  });

  it('should trigger onFocus and onBlur', () => {
    const name = 'name';
    const value = 'value';
    const onFieldFocus = jest.fn();
    const onFieldBlur = jest.fn();
    const field = <Field name={name} render={renderInput}/>;
    const model = { [name]: value };
    const context = mockFormContext(model, { onFieldFocus, onFieldBlur });

    const element = mount(field, { context });
    const wrapper = element.find('input');
    const onFocus = wrapper.props().onFocus;
    const onBlur = wrapper.props().onBlur;

    expect(onFieldFocus).not.toHaveBeenCalled();
    expect(onFieldBlur).not.toHaveBeenCalled();

    onFocus!({} as any);

    expect(onFieldFocus).toHaveBeenCalled();
    expect(onFieldBlur).not.toHaveBeenCalled();

    onBlur!({} as any);

    expect(onFieldBlur).toHaveBeenCalled();
  });

  it('should trigger onMount and onUnmount', () => {
    const name = 'name';
    const value = 'value';
    const onFieldMount = jest.fn();
    const onFieldUnmount = jest.fn();
    const field = <Field name={name} render={renderInput}/>;
    const model = { [name]: value };
    const context = mockFormContext(model, { onFieldMount, onFieldUnmount });

    const element = mount(field, { context });

    expect(onFieldMount).toHaveBeenCalled();
    expect(onFieldUnmount).not.toHaveBeenCalled();

    element.unmount();

    expect(onFieldUnmount).toHaveBeenCalled();
  });

  it('should support grouping', () => {
    const model = { testGroup1: { testGroup2: { name: 'value' } } };
    const context: FormContext<any> & FieldGroupContext = {
      ...mockFormContext(model),
      groups: ['testGroup1', 'testGroup2']
    };

    const element = mount(
      <Field name={'name'} render={renderInput}/>
      , { context }
    );
    const input = element.find('input');
    expect(input.props().value).toBe('value');
  });

  it('should support null as name', () => {
    const model = { testGroup1: { testGroup2: 'value' } };
    const context: FormContext<any> & FieldGroupContext = {
      ...mockFormContext(model),
      groups: ['testGroup1', 'testGroup2']
    };

    const element = mount(
      <Field name={null} render={renderInput}/>
      , { context });

    const input = element.find('input');
    expect(input.props().value).toBe('value');
  });

  it('should trigger onFieldChange in group', () => {
    const name = 'name';
    const value = 'value';
    const onFieldChange = jest.fn();
    const field = <Field name={name} render={renderInput}/>;
    const model = { group1: { group2: { [name]: value } } };
    const context: FormContext<any> & FieldGroupContext = {
      ...mockFormContext(model, { onFieldChange }),
      groups: ['group1', 'group2']
    };
    const element = mount(field, { context });
    const wrapper = element.find('input');
    const onChange = wrapper.props().onChange;

    expect(onFieldChange).not.toHaveBeenCalled();

    const newValue = 'newValue';
    onChange!(mockEvent(newValue));

    expect(onFieldChange).toHaveBeenCalledWith(['group1', 'group2', name], newValue);
  });
});
