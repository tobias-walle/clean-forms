import { mount, ReactWrapper, shallow } from 'enzyme';
import * as React from 'react';
import { ValidationDefinition } from '../../utils/validation';
import { FieldGroup } from '../FieldGroup/FieldGroup';
import { InputField } from '../InputField/InputField';
import { Form, FormState } from './Form';

describe('Form', () => {
  it('should render', () => {
    expect(shallow(<Form state={{ model: {}}}/>)).toMatchSnapshot();
  });

  it('should render model in inputs', () => {
    const model = {
      a: 'hello',
      b: 124
    };
    const element = mount(
      <Form state={{model}}>
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
      <Form state={{ model }} onChange={onChange}>
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
      model: {
        ...model,
        a: expectedNewValue
      }
    }, expect.anything());
  });

  it('should emit model changes in groups', () => {
    const onChange = jest.fn();
    const model = {
      a: 'hello',
      b: 124,
      c: {
        c1: 'old'
      }
    };
    const element = mount(
      <Form state={{ model }} onChange={onChange}>
        <InputField name={'a'}/>
        <InputField name={'b'} inner={{
          type: 'number'
        }}/>
        <FieldGroup name={'c'}>
          <InputField name={'c1'}/>
        </FieldGroup>
      </Form>
    );
    const expectedNewValue = 'new';
    const inputs = element.find('input');
    const thirdInput = inputs.at(2);

    expect(onChange).not.toHaveBeenCalled();

    thirdInput.simulate('change', { target: { value: expectedNewValue } });

    expect(onChange).toHaveBeenCalledWith({
      model: {
        ...model,
        c: { c1: expectedNewValue }
      }
    }, expect.anything());
  });

  it('should validate model', () => {
    const onChange = jest.fn();
    const model = {
      a: 'hello',
      b: 124
    };
    type Model = typeof model;
    const ERROR_A = 'Has to be greater than 10 characters';
    const ERROR_B = 'Has to be smaller than 100';
    const validationDefinition: ValidationDefinition<Model> = {
      a: ({ value }) => value.length >= 10 ? null : ERROR_A,
      b: ({ value }) => value < 100 ? null : ERROR_B,
    };
    const element = mount(
      <Form state={{ model }} validation={validationDefinition} onChange={onChange}>
        <InputField name={'a'}/>
        <InputField name={'b'} inner={{
          type: 'number'
        }}/>
      </Form>
    );
    const inputs = element.find('input');
    const firstInput = inputs.first();
    firstInput.simulate('change', { target: { value: '0123456789' } });

    expect(onChange).toHaveBeenCalledWith(expect.anything(), {
      errors: {
        b: ERROR_B
      }
    });

    firstInput.simulate('change', { target: { value: '012345678' } });

    expect(onChange).toHaveBeenCalledWith(expect.anything(), {
      errors: {
        a: ERROR_A,
        b: ERROR_B
      }
    });

  });
})
;
