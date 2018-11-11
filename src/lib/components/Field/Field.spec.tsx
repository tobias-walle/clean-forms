import { mount, render } from 'enzyme';
import * as React from 'react';
import { withFormContext, withGroupContext } from '../../../testUtils/context';
import { renderInput } from '../../../testUtils/InputField';
import { mockEvent } from '../../../testUtils/mockEvent';
import { mockFormContext } from '../../../testUtils/mockFormContext';
import { FormApi } from '../../api';
import { FieldGroupContextValue } from '../../contexts/field-group-context';
import { FormContextValue } from '../../contexts/form-context';
import { DEFAULT_FIELD_STATUS } from '../../statusTracking';
import { Field, FieldProps, InnerFieldProps } from './Field';

describe('Field', () => {
  it('should render', () => {
    const field = <Field name={'name'} render={renderInput} inner={{}}/>;
    const model = { name: 'value' };
    const context: FormContextValue<any> = mockFormContext(model);
    expect(render(withFormContext(context)(field))).toMatchSnapshot();
  });

  it('should pass props', () => {
    const mockRender = jest.fn(renderInput);
    const name = 'name';
    const value = 'value';
    const type = 'number';
    const field = <Field name={name} render={mockRender} inner={{ type }}/>;
    const model = { [name]: value };
    const context = mockFormContext(model);

    mount(withFormContext(context)(field));

    const expectedInput: InnerFieldProps<any, any> = {
      input: {
        name, value,
        onChange: expect.any(Function),
        onFocus: expect.any(Function),
        onBlur: expect.any(Function),
        ...DEFAULT_FIELD_STATUS,
        error: undefined,
        valid: true,
        inValid: false
      },
      custom: { type },
      form: context.form
    };
    expect(mockRender).toBeCalledWith(expectedInput);
  });

  it('should pass props for invalid field', () => {
    const mockRender = jest.fn(renderInput);
    const name = 'name';
    const value = 'value';
    const type = 'number';
    const field = <Field name={name} render={mockRender} inner={{ type }}/>;
    const model = { [name]: value };
    const context = mockFormContext(model, {
      form: new FormApi({ model }, {}, { name: 'Error' })
    });

    mount(withFormContext(context)(field));

    const expectedInput: InnerFieldProps<any, any> = {
      input: {
        name, value,
        onChange: expect.any(Function),
        onFocus: expect.any(Function),
        onBlur: expect.any(Function),
        ...DEFAULT_FIELD_STATUS,
        error: 'Error',
        valid: false,
        inValid: true
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
    const field = <Field name={name} render={renderInput} inner={{}}/>;
    const model = { [name]: value };
    const context = mockFormContext(model, { onFieldChange });

    const element = mount(withFormContext(context)(field));
    const wrapper = element.find('input');
    const onChange = wrapper.props().onChange;

    expect(onFieldChange).not.toHaveBeenCalled();

    const newValue = 'newValue';
    onChange!(mockEvent(newValue));

    expect(onFieldChange).toHaveBeenCalledWith(name, name, newValue);
  });

  it('should trigger onFocus and onBlur', () => {
    const name = 'name';
    const value = 'value';
    const onFieldFocus = jest.fn();
    const onFieldBlur = jest.fn();
    const field = <Field name={name} render={renderInput} inner={{}}/>;
    const model = { [name]: value };
    const context = mockFormContext(model, { onFieldFocus, onFieldBlur });

    const element = mount(withFormContext(context)(field));
    const wrapper = element.find('input');
    const onFocus = wrapper.props().onFocus;
    const onBlur = wrapper.props().onBlur;

    expect(onFieldFocus).not.toHaveBeenCalled();
    expect(onFieldBlur).not.toHaveBeenCalled();

    onFocus!({} as any);

    expect(onFieldFocus).toHaveBeenCalledWith(name);
    expect(onFieldBlur).not.toHaveBeenCalled();

    onBlur!({} as any);

    expect(onFieldBlur).toHaveBeenCalledWith(name);
  });

  it('should trigger onMount and onUnmount', () => {
    const name = 'name';
    const value = 'value';
    const onFieldMount = jest.fn();
    const onFieldUnmount = jest.fn();
    const field = <Field name={name} render={renderInput} inner={{}}/>;
    const model = { [name]: value };
    const context = mockFormContext(model, { onFieldMount, onFieldUnmount });

    const element = mount(withFormContext(context)(field), { context });

    expect(onFieldMount).toHaveBeenCalledWith(name);
    expect(onFieldUnmount).not.toHaveBeenCalled();

    element.unmount();

    expect(onFieldUnmount).toHaveBeenCalledWith(name);
  });

  it('should support namespace and path', () => {
    const model = { testGroup1: { testGroup2: { name: 'value' } } };
    const formContext: FormContextValue<any> = mockFormContext(model);
    const groupContext: FieldGroupContextValue = {
      namespace: 'testGroup1.testGroup2',
      path: 'testGroup1.testGroup2',
    };

    const element = mount(
      withFormContext(formContext)(withGroupContext(groupContext)(<Field name={'name'} render={renderInput}
                                                                         inner={{}}/>))
    );
    const input = element.find('input');
    expect(input.props().value).toBe('value');
  });

  it('should support null as name', () => {
    const model = { testGroup1: { testGroup2: 'value' } };
    const formContext: FormContextValue<any> = mockFormContext(model);
    const groupContext: FieldGroupContextValue = {
      namespace: 'testGroup1.testGroup2',
      path: 'testGroup1.testGroup2'
    };

    const element = mount(
      withFormContext(formContext)(withGroupContext(groupContext)(<Field name={null} render={renderInput} inner={{}}/>))
    );

    const input = element.find('input');
    expect(input.props().value).toBe('value');
  });

  it('should trigger onFieldChange in group', () => {
    const name = 'name';
    const value = 'value';
    const onFieldChange = jest.fn();
    const field = <Field name={name} render={renderInput} inner={{}}/>;
    const model = { group1: { group2: { [name]: value } } };
    const formContext: FormContextValue<any> = mockFormContext(model, { onFieldChange });
    const groupContext: FieldGroupContextValue = {
      namespace: 'group1.group2',
      path: 'group1.group2',
    };
    const element = mount(withFormContext(formContext)(withGroupContext(groupContext)(field)));
    const wrapper = element.find('input');
    const onChange = wrapper.props().onChange;

    expect(onFieldChange).not.toHaveBeenCalled();

    const newValue = 'newValue';
    onChange!(mockEvent(newValue));

    expect(onFieldChange).toHaveBeenCalledWith('group1.group2.name', 'group1.group2.name', newValue);
  });

  describe('shouldComponentUpdate', () => {
    it('should update if render has changed', () => {
      const props: FieldProps<any, any> = {
        name: 'value',
        inner: { a: 1 },
        render: renderInput,
        updateOnEveryFormChange: false,
      };
      const model = { value: 'test', value2: 'test2' };
      const formContext: FormContextValue<any> = mockFormContext(model);

      const component = mount(withFormContext(formContext)(<Field {...props}/>)).find(Field).childAt(0).instance();

      const contextProps = { formContext, groupContext: {} };

      expect(component.shouldComponentUpdate!({ ...props, ...contextProps }, {}, {})).toBe(false);
      expect(component.shouldComponentUpdate!({
        ...props,
        ...contextProps,
        groupContext: {
          name: 'value2'
        }
      }, {}, {})).toBe(true);
      expect(component.shouldComponentUpdate!({ ...props, ...contextProps, inner: { a: 2 } }, {}, {})).toBe(true);
      expect(component.shouldComponentUpdate!({
        ...props,
        ...contextProps,
        updateOnEveryFormChange: true
      }, {}, {})).toBe(false);
      expect(component.shouldComponentUpdate!({
        ...props,
        ...contextProps,
        formContext: mockFormContext({ ...model, value: 'test2' })
      }, {}, {})).toBe(true);
    });
  });
});
