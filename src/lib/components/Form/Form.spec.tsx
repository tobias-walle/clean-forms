import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { Field, FieldArray, FieldArrayItems } from '../';
import { InputField } from '../../../testUtils/InputField';
import { wait } from '../../../testUtils/wait';
import { FieldRegister } from '../../utils/FieldRegister';
import { DEFAULT_FIELD_STATUS, FieldStatus } from '../../utils/statusTracking/FieldStatus';
import { FieldStatusMapping } from '../../utils/statusTracking/FieldStatusMapping';
import {
  ArrayValidation, FieldErrorMapping,
  ValidationDefinition
} from '../../utils/validation';
import { FieldGroup } from '../FieldGroup/FieldGroup';
import { Form, FormContext } from './Form';

describe('Form', () => {
  it('should render', () => {
    expect(shallow(<Form state={{ model: {} }}/>)).toMatchSnapshot();
  });

  it('should render model in inputs', () => {
    const model = {
      a: 'hello',
      b: 124
    };
    const element = mount(
      <Form state={{ model }}>
        <InputField name={'a'}/>
        <InputField name={'b'} type="number"/>
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
    const status: FieldStatusMapping = initFieldStatusMapping('a');
    const element = mount(
      <Form state={{ model, status }} onChange={onChange}>
        <InputField name={'a'}/>
        <InputField name={'b'} type="number"/>
      </Form>
    );
    const expectedNewValue = 'new';
    const inputs = element.find('input');
    const firstInput = inputs.first();

    firstInput.simulate('change', { target: { value: expectedNewValue } });

    expect(onChange).toHaveBeenCalledWith({
      model: {
        ...model,
        a: expectedNewValue
      },
      status: expect.anything()
    });
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
    const status: FieldStatusMapping = initFieldStatusMapping('a', 'b', 'c.c1');
    const element = mount(
      <Form state={{ model, status }} onChange={onChange}>
        <InputField name={'a'}/>
        <InputField name={'b'} type="number"/>
        <FieldGroup name={'c'}>
          <InputField name={'c1'}/>
        </FieldGroup>
      </Form>
    );
    const expectedNewValue = 'new';
    const inputs = element.find('input');
    const thirdInput = inputs.at(2);

    thirdInput.simulate('change', { target: { value: expectedNewValue } });

    expect(onChange).toHaveBeenCalledWith({
      model: {
        ...model,
        c: { c1: expectedNewValue }
      },
      status: expect.anything()
    });
  });

  it('should initialize status', () => {
    const onChange = jest.fn();
    const model = { a: 'hello', b: 124 };
    const expectFieldStatus = createFieldStatusExpectFunction(onChange);

    mount(
      <Form state={{ model }} onChange={onChange}>
        <InputField name={'a'}/>
        <InputField name={'b'} type="number"/>
      </Form>
    );
    expectFieldStatus({
      a: new FieldStatus({ dirty: false, touched: false }),
      b: new FieldStatus({ dirty: false, touched: false })
    });
  });

  it('should update dirty/pristine status', async () => {
    const onChange = jest.fn();
    const model = { a: 'hello', b: 124 };
    const status: FieldStatusMapping = initFieldStatusMapping('a', 'b');
    const expectFieldStatus = createFieldStatusExpectFunction(onChange);
    const element = mount(
      <Form state={{ model, status }} onChange={onChange}>
        <InputField name={'a'}/>
        <InputField name={'b'} type="number"/>
      </Form>
    );
    const inputs = element.find('input');
    const firstInput = inputs.first();

    firstInput.simulate('change', { target: { value: '0123456789' } });

    expectFieldStatus({
      a: new FieldStatus({ dirty: true, touched: false }),
      b: DEFAULT_FIELD_STATUS
    });
  });

  it('should update touched/untouched status', async () => {
    const onChange = jest.fn();
    const model = { a: 'hello', b: 124 };
    const status: FieldStatusMapping = initFieldStatusMapping('a', 'b');
    const expectFieldStatus = createFieldStatusExpectFunction(onChange);
    const element = mount(
      <Form state={{ model, status }} onChange={onChange}>
        <InputField name={'a'}/>
        <InputField name={'b'} type="number"/>
      </Form>
    );
    const inputs = element.find('input');
    const firstInput = inputs.first();

    firstInput.simulate('blur', {});

    expectFieldStatus({
      a: new FieldStatus({ dirty: false, touched: true }),
      b: DEFAULT_FIELD_STATUS
    });
  });

  it('should update validation result', async () => {
    const model = { a: 'hello', b: 124 };
    const status = initFieldStatusMapping('a');
    const error = 'The value has to have a greater length than 10';
    const validators: ValidationDefinition<typeof model> = {
      a: ({ value }) => value.length > 10 ? null : error
    };
    const renderForm = jest.fn(() => (
      <>
      <InputField name={'a'}/>
      <InputField name={'b'} type="number"/>
      </>
    ));
    const expectValidationResult = createValidationResultExpectFunction(renderForm);
    mount(<Form state={{ model, status }} validation={validators} render={renderForm}/>);

    expectValidationResult({
      a: error
    });

  });

  it('should update validation result for array', async () => {
    const model = { array: [] };
    const status = initFieldStatusMapping('array', 'array.hello');
    const error = 'The array needs at least 1 item';
    const validators: ValidationDefinition<typeof model> = {
      array: new ArrayValidation(null, ({ value }) => value.length >= 1 ? null : error)
    };
    const renderForm = jest.fn(() => (
      <FieldArray name={'array'} render={() => (
        <FieldArrayItems getKey={item => item} render={() =>
          <InputField name={null}/>
        }/>
      )}/>
    ));
    const expectValidationResult = createValidationResultExpectFunction(renderForm);
    mount(
      <Form state={{ model, status }} validation={validators} render={renderForm}/>
    );
    expectValidationResult({
      array: error
    });
  });

  it('should remove status if field unmounts', async () => {
    const onChange = jest.fn();
    const model = { a: 'test' };
    const expectFieldStatus = createFieldStatusExpectFunction(onChange);
    const element = mount(
      <Form state={{ model, status: { a: DEFAULT_FIELD_STATUS } }} onChange={onChange}>
        <InputField name={'a'}/>
      </Form>
    );
    const context: FormContext<any> = element.find(Field).instance().context;

    context.onFieldUnmount('a');

    await wait(10);

    expectFieldStatus({});
  });

  it('should remove status if array item is removed', async () => {
    const onChange = jest.fn();
    const model = { array: ['a', 'b'] };
    const status: FieldStatusMapping = initFieldStatusMapping('array', 'array.a', 'array.b');
    const expectFieldStatus = createFieldStatusExpectFunction(onChange);
    const element = mount(
      <Form state={{ model, status }} onChange={onChange}>
        <FieldArray name={'array'} render={() => (
          <FieldArrayItems getKey={item => item} render={() => (
            <InputField name={null}/>
          )}/>
        )}/>
      </Form>
    );
    const context: FormContext<any> = element.find(Field).first().instance().context;

    context.onFieldUnmount('array.a');

    await waitForDebounce();

    expectFieldStatus({
      array: DEFAULT_FIELD_STATUS,
      'array.b': DEFAULT_FIELD_STATUS
    });
  });

  it('should trigger onSubmit', () => {
    const model = { a: 123 };
    const onSubmit = jest.fn();
    const element = shallow(
      <Form state={{model}} onSubmit={onSubmit}/>
    );

    const form = element.find('form');
    form.props().onSubmit!(new Event('test') as any);

    expect(onSubmit).toHaveBeenCalledWith({
      state: { model },
      validationDefinition: expect.anything(),
      fieldErrorMapping: expect.anything(),
      valid: true,
      inValid: false
    });
  });
});

function createFieldStatusExpectFunction(onChange: jest.Mock<any>) {
  return (fieldStatusMapping: FieldStatusMapping) => {
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0].status).toEqual(fieldStatusMapping);
  };
}

function createValidationResultExpectFunction(renderForm: jest.Mock<any>) {
  return (fieldErrorMapping: FieldErrorMapping) => {
    const lastCall = renderForm.mock.calls[renderForm.mock.calls.length - 1];
    expect(lastCall[0].fieldErrorMapping).toEqual(fieldErrorMapping);
  };
}

function waitForDebounce(): Promise<void> {
  return wait(FieldRegister.DEBOUNCE_IN_MS);
}

function initFieldStatusMapping(...keys: string[]): FieldStatusMapping {
  return keys.reduce((result, key) => {
    result[key] = DEFAULT_FIELD_STATUS;
    return result;
  }, {} as FieldStatusMapping);
}
