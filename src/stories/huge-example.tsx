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

type Model = Record<string, any>;

type MyFormState = FormState<Model>;

export class MyHugeForm extends React.Component<{}, MyFormState> {
  public state: MyFormState = {
    model: generateModel(),
  };
  private validation: ValidationDefinition<Model> = {
    ...(Object.keys(this.state.model).reduce((result, key) => ({
      [key]: required,
    }), {})),
  };

  public render() {
    return (
      <Form
        state={this.state}
        validation={this.validation}
        onChange={this.onChange}
        onValidSubmit={() => console.info('Submit Successful')}
      >
        {Object.keys(this.state.model).map(key => <Input label={key} name={key}/>)}
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

function generateModel(): Model {
  const model: Model = {};
  for (let i = 0; i < 1000; i++) {
    model[Math.random().toString(32).substr(2)] = '';
  }
  return model;
}
