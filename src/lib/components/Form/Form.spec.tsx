import { mount, ReactWrapper, shallow } from 'enzyme';
import * as React from 'react';
import { Field, FieldArray, FieldArrayItems } from '../';
import { InputField } from '../../../testUtils/InputField';
import { wait } from '../../../testUtils/wait';
import { FormState } from '../../api';
import { createField } from '../../hocs';
import { DEFAULT_FIELD_STATUS, FieldStatus, FieldStatusMapping } from '../../statusTracking';
import { FieldRegister } from '../../utils';
import { ArrayValidation, FieldErrorMapping, ValidationDefinition } from '../../validation';
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
      <FieldArray getKey={item => item} name={'array'} render={() => (
        <FieldArrayItems render={() =>
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
        <FieldArray getKey={item => item} name={'array'} render={() => (
          <FieldArrayItems render={() => (
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
      <Form state={{ model }} onSubmit={onSubmit}/>
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

  it('should trigger onValidSubmit', () => {
    const model = { a: 123 };
    const onValidSubmit = jest.fn();
    const onInValidSubmit = jest.fn();
    const element = shallow(
      <Form state={{ model }} onValidSubmit={onValidSubmit} onInValidSubmit={onInValidSubmit}/>
    );

    const form = element.find('form');
    form.props().onSubmit!(new Event('test') as any);

    expect(onValidSubmit).toHaveBeenCalled();
    expect(onInValidSubmit).not.toHaveBeenCalled();
  });

  it('should trigger onInValidSubmit', () => {
    const model = { a: 123 };
    const validation = { a: () => 'Error' };
    const onValidSubmit = jest.fn();
    const onInValidSubmit = jest.fn();
    const element = shallow(
      <Form state={{ model }} validation={validation} onValidSubmit={onValidSubmit} onInValidSubmit={onInValidSubmit}/>
    );

    const form = element.find('form');
    form.props().onSubmit!(new Event('test') as any);

    expect(onValidSubmit).not.toHaveBeenCalled();
    expect(onInValidSubmit).toHaveBeenCalled();
  });

  it('should mark all fields as touched on submit', () => {
    const model = { a: 123, b: 1 };
    const status: FieldStatusMapping = { a: DEFAULT_FIELD_STATUS, b: DEFAULT_FIELD_STATUS };
    const onChange = jest.fn();
    const element = mount(
      <Form state={{ model, status }} onChange={onChange}>
        <InputField name={'a'}/>
        <InputField name={'b'}/>
      </Form>
    );
    const form = element.find('form');

    form.props().onSubmit!(new Event('test') as any);

    expect(onChange).toHaveBeenCalledWith({
      model, status: {
        a: new FieldStatus({ touched: true, dirty: false }),
        b: new FieldStatus({ touched: true, dirty: false }),
      }
    });
  });
});

describe('Integration Tests', () => {
  it('should work with normal form', () => {
    interface Model {
      user: {
        name: {
          first: string;
          last: string;
        }
      };
      age: number;
      password: string;
    }

    type FormWrapperState = FormState<Model>;

    class FormWrapper extends React.Component<{}, FormWrapperState> {
      public state: FormWrapperState = {
        model: {
          user: {
            name: {
              first: '',
              last: '',
            }
          },
          age: 0,
          password: '',
        },
      };

      public render() {
        return (
          <Form
            state={this.state}
            onChange={newState => this.setState(newState)}
          >
            <FieldGroup name="user">
              <InputField name="name.first"/>
              <InputField name="name.last"/>
            </FieldGroup>
            <InputField type="number" name="age"/>
            <InputField type="password" name="password"/>
          </Form>
        );
      }
    }

    const form = mount(<FormWrapper/>);

    setInputValue(form.find('input[name="name.first"]'), 'First Name');
    setInputValue(form.find('input[name="name.last"]'), 'Last Name');
    setInputValue(form.find('input[name="age"]'), '18');
    setInputValue(form.find('input[name="password"]'), 'secret');

    expect(form.state()).toEqual({
      model: {
        user: {
          name: {
            first: 'First Name',
            last: 'Last Name',
          }
        },
        age: 18,
        password: 'secret',
      },
      status: {
        age: new FieldStatus({ dirty: true, touched: false }),
        password: new FieldStatus({ dirty: true, touched: false }),
        'user.name.first': new FieldStatus({ dirty: true, touched: false }),
        'user.name.last': new FieldStatus({ dirty: true, touched: false }),
      }
    });
  });

  it('should work with inputs that set the value on componentDidMount', () => {
    interface Model {
      value1: string;
      value2: string;
      value3: string;
    }

    interface SelfUpdatingInputProps {
      name?: string;
      value: string;
      onChange: (value: string) => void;
    }

    class SelfUpdatingInput extends React.Component<SelfUpdatingInputProps, {}> {
      public render() {
        return (
          <input
            name={this.props.name}
            value={this.props.value}
            onChange={(event) => this.props.onChange(event.target.value)}
          />
        );
      }

      public componentDidMount() {
        this.props.onChange('initialValue');
      }
    }

    const SelfUpdatingInputField = createField<string, {}>(({ input }) => (
      <SelfUpdatingInput name={input.name} value={input.value} onChange={input.onChange}/>
    ));

    type FormWrapperState = FormState<Model>;

    class FormWrapper extends React.Component<{}, FormWrapperState> {
      public state: FormWrapperState = {
        model: {
          value1: '',
          value2: '',
          value3: '',
        },
      };

      public render() {
        return (
          <Form
            state={this.state}
            onChange={newState => {
              this.setState(state => newState);
            }}
          >
            <SelfUpdatingInputField name="value1"/>
            <SelfUpdatingInputField name="value2"/>
            <SelfUpdatingInputField name="value3"/>
          </Form>
        );
      }
    }

    const form = mount(<FormWrapper/>);

    setInputValue(form.find('input[name="value3"]'), 'otherValue');

    expect(form.state()).toEqual({
      model: {
        value1: 'initialValue',
        value2: 'initialValue',
        value3: 'otherValue',
      },
      status: {
        value1: new FieldStatus({ dirty: false, touched: false }),
        value2: new FieldStatus({ dirty: false, touched: false }),
        value3: new FieldStatus({ dirty: true, touched: false }),
      }
    });
  });

});

function setInputValue(wrapper: ReactWrapper<any>, value: string) {
  (wrapper.getDOMNode() as any).value = value;
  wrapper.simulate('change');
}

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
