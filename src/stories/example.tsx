import * as React from 'react';
import { createField, FieldGroup, Form, FormState, ValidationDefinition, ValidationFunction } from '../lib';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = createField<string | number, InputProps>(({
  input: {
    name,
    onFocus,
    onChange,
    onBlur,
    error,
    touched
  },
  custom
}) => {
  return (
    <div>
      <label>
        <span>{custom.label}: </span>
        <input
          name={name}
          onChange={event => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          {...custom}
        />
        <span>{touched ? error : ''}</span>
      </label>
    </div>
  );
});

const required: ValidationFunction<string> =
  ({ value }) => value === ''
    ? 'The field is required'
    : null;

interface Model {
  username: string;
  password: string;
  realName: {
    first: string;
    last: string;
  };
}

type MyFormState = FormState<Model>;

export class MyForm extends React.Component<{}, MyFormState> {
  public state: MyFormState = {
    model: {
      username: '',
      password: '',
      realName: {
        first: '',
        last: '',
      }
    }
  };
  private validation: ValidationDefinition<Model> = {
    username: required,
    password: required,
    realName: {
      first: required,
      last: required,
    }
  };

  public render() {
    return (
      <Form
        state={this.state}
        validation={this.validation}
        onChange={this.onChange}
        onValidSubmit={() => console.info('Submit Successful')}
      >
        <Input name={'username'} label={'Username'}/>
        <Input name={'password'} label={'Password'} type={'password'}/>
        <FieldGroup name={'realName'}>
          <Input name={'first'} label={'First Name'}/>
          <Input name={'last'} label={'Last Name'}/>
        </FieldGroup>
        <div>
          <button>Submit</button>
        </div>
      </Form>
    );
  }

  private onChange = (newState: MyFormState): void => {
    this.setState(newState);
  };
}
