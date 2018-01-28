import { mount, ReactWrapper, shallow } from 'enzyme';
import * as React from 'react';
import { Field, FieldArray, FieldArrayItems } from '../';
import { mockEvent } from '../../../testUtils/mockEvent';
import { wait } from '../../../testUtils/wait';
import { DEFAULT_FIELD_STATUS } from '../../utils/statusTracking/FieldStatus';
import { FieldStatusMapping } from '../../utils/statusTracking/FieldStatusMapping';
import { ArrayValidation, ValidationDefinition } from '../../utils/validation';
import { AddItem } from '../FieldArray/FieldArray';
import { FieldGroup } from '../FieldGroup/FieldGroup';
import { InputField } from '../InputField/InputField';
import { Form, FormContext, FormState } from './Form';

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

    firstInput.simulate('change', { target: { value: expectedNewValue } });

    expect(onChange).toHaveBeenCalledWith({
      model: {
        ...model,
        a: expectedNewValue
      },
      status: expect.anything()
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

    thirdInput.simulate('change', { target: { value: expectedNewValue } });

    expect(onChange).toHaveBeenCalledWith({
      model: {
        ...model,
        c: { c1: expectedNewValue }
      },
      status: expect.anything()
    }, expect.anything());
  });

  it('should initialize status', () => {
    const onChange = jest.fn();
    const model = { a: 'hello', b: 124 };
    const expectFieldStatus = createFieldStatusExpectFunction(onChange);

    mount(
      <Form state={{ model }} onChange={onChange}>
        <InputField name={'a'}/>
        <InputField name={'b'} inner={{
          type: 'number'
        }}/>
      </Form>
    );
    expectFieldStatus({
      a: {
        valid: true,
        inValid: false,
        pristine: true,
        dirty: false,
        untouched: true,
        touched: false
      },
      b: {
        valid: true,
        inValid: false,
        pristine: true,
        dirty: false,
        untouched: true,
        touched: false
      }
    });
  });

  it('should update dirty/pristine status', async () => {
    const onChange = jest.fn();
    const model = { a: 'hello', b: 124 };
    const expectFieldStatus = createFieldStatusExpectFunction(onChange);
    const element = mount(
      <Form state={{ model }} onChange={onChange}>
        <InputField name={'a'}/>
        <InputField name={'b'} inner={{
          type: 'number'
        }}/>
      </Form>
    );
    const inputs = element.find('input');
    const firstInput = inputs.first();

    firstInput.simulate('change', { target: { value: '0123456789' } });

    expectFieldStatus({
      a: {
        valid: true,
        inValid: false,
        pristine: false,
        dirty: true,
        untouched: true,
        touched: false
      }
    });
  });

  it('should update touched/untouched status', async () => {
    const onChange = jest.fn();
    const model = { a: 'hello', b: 124 };
    const expectFieldStatus = createFieldStatusExpectFunction(onChange);
    const element = mount(
      <Form state={{ model }} onChange={onChange}>
        <InputField name={'a'}/>
        <InputField name={'b'} inner={{
          type: 'number'
        }}/>
      </Form>
    );
    const inputs = element.find('input');
    const firstInput = inputs.first();

    firstInput.simulate('focus', {});

    expectFieldStatus({
      a: {
        valid: true,
        inValid: false,
        pristine: true,
        dirty: false,
        untouched: false,
        touched: true
      }
    });
  });

  it('should update valid/invalid/error status', async () => {
    const onChange = jest.fn();
    const model = { a: 'hello', b: 124 };
    const error = 'The value has to have a greater length than 10';
    const validators: ValidationDefinition<typeof model> = {
      a: ({ value }) => value.length > 10 ? null : error
    };
    const expectFieldStatusUpdate = createFieldStatusExpectFunction(onChange);
    const element = mount(
      <Form state={{ model }} validation={validators} onChange={onChange}>
        <InputField name={'a'}/>
        <InputField name={'b'} inner={{
          type: 'number'
        }}/>
      </Form>
    );
    const inputs = element.find('input');
    const firstInput = inputs.first();

    expectFieldStatusUpdate({
      a: {
        valid: false,
        inValid: true,
        pristine: true,
        dirty: false,
        untouched: true,
        touched: false,
        error
      },
      b: {
        valid: true,
        inValid: false,
        pristine: true,
        dirty: false,
        untouched: true,
        touched: false
      },
    });

    firstInput.simulate('change', mockEvent('01234567890'));

    expectFieldStatusUpdate({
      a: {
        valid: true,
        inValid: false,
        pristine: false,
        dirty: true,
        untouched: true,
        touched: false
      },
    });
  });

  it('should update valid/invalid/error status for array', async () => {
    const onChange = jest.fn();
    const model = { array: ['hello'] };
    const error = 'The array needs at least 1 item';
    const validators: ValidationDefinition<typeof model> = {
      array: new ArrayValidation(null, ({ value }) => value.length >= 1 ? null : error)
    };
    const expectFieldStatusUpdate = createFieldStatusExpectFunction(onChange);
    let removeItem: (() => void) | null = null;
    mount(
      <Form state={{ model }} validation={validators} onChange={onChange}>
        <FieldArray name={'array'} render={() => (
          <FieldArrayItems render={(args) => {
            removeItem = args.remove;
            return <InputField name={null}/>;
          }}/>
        )}/>
      </Form>
    );

    expectFieldStatusUpdate({
      array: {
        0: {
          valid: true,
          inValid: false,
          pristine: true,
          dirty: false,
          untouched: true,
          touched: false,
        },
        valid: true,
        inValid: false,
        pristine: true,
        dirty: false,
        untouched: true,
        touched: false,
      },
    });

    removeItem!();

    expectFieldStatusUpdate({
      array: {
        valid: false,
        inValid: true,
        pristine: false,
        dirty: true,
        untouched: true,
        touched: false,
        error
      },
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

    context.onFieldUnmount(['a']);

    await wait(10);

    expectFieldStatus({});
  });
});

function createFieldStatusExpectFunction(onChange: jest.Mock<any>) {
  return (fieldStatusMapping: FieldStatusMapping<any>) => {
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0].status).toEqual(fieldStatusMapping);
  };
}
