import * as React from 'react';
import {
  ArrayValidation,
  createField, FieldArray, FieldArrayItems,
  FieldGroup,
  Form,
  FormState,
  ValidationDefinition,
  ValidationFunction
} from '../lib';

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

type Data = Record<string, any>;

interface Model {
  a: Data;
  b: {
    c: {
      d: Data
    }
  };
  e: Data[];
}

type MyFormState = FormState<Model>;

const arrayData = generateData(10);

export class MyHugeForm extends React.Component<{}, MyFormState> {
  public state: MyFormState = {
    model: {
      a: generateData(),
      b: {
        c: {
          d: generateData(),
        }
      },
      e: [
        { ...arrayData },
        { ...arrayData },
        { ...arrayData }
      ]
    }
  };

  private validation: ValidationDefinition<Model> = {
    a: createValidationForData(this.state.model.a),
    b: {
      c: {
        d: createValidationForData(this.state.model.b.c.d)
      }
    },
    e: new ArrayValidation(createValidationForData(arrayData))
  };

  public render() {
    return (
      <Form
        state={this.state}
        validation={this.validation}
        onChange={this.onChange}
        onValidSubmit={() => console.info('Submit Successful')}
      >
        <h3>a</h3>
        <FieldGroup name="a">
          {this.renderDataInputFields(this.state.model.a)}
        </FieldGroup>
        <h3>b.c.d</h3>
        <FieldGroup name="b">
          <FieldGroup name="c">
            <FieldGroup name="d">
              {this.renderDataInputFields(this.state.model.b.c.d)}
            </FieldGroup>
          </FieldGroup>
        </FieldGroup>
        <h3>e</h3>
        <FieldArray name="e" render={() => (
          <FieldArrayItems render={({index}) => this.renderDataInputFields(this.state.model.e[index])}/>
        )}/>
        <div>
          <button>Submit</button>
        </div>
      </Form>
    );
  }

  private renderDataInputFields(data: Data) {
    return Object.keys(data).map(key => <Input key={key} label={key} name={key}/>);
  }

  private onChange = (newState: MyFormState): void => {
    this.setState(newState);
  };
}

function generateData(n = 100): Data {
  const model: Data = {};
  for (let i = 0; i < n; i++) {
    model[Math.random().toString(32).substr(2)] = '';
  }
  return model;
}

function createValidationForData<T>(data: T): ValidationDefinition<T> {
  return (Object.keys(data).reduce((result, key) => ({
    [key]: required,
  }), {}));
}
