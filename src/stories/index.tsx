import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { Form } from '../lib';
import { FieldArray, FieldArrayItems, InputField } from '../lib/components';
import { FieldGroup } from '../lib/components/FieldGroup/FieldGroup';
import { ValidationDefinition } from '../lib/utils/validation';
import { StateFullForm } from './StateFullForm/StateFullForm';

storiesOf('Form', module)
  .add('default', () => (
    <StateFullForm
      initialState={{
        model: {
          value1: 'First Value',
          value2: 'Second Value',
          value3: Math.PI,
        }
      }}
    >
      <InputField name={'value1'} inner={{ label: 'Value 1' }}/>
      <InputField name={'value2'} inner={{ label: 'Value 2' }}/>
      <InputField name={'value3'} inner={{ label: 'Value 3', type: 'number' }}/>
    </StateFullForm>
  ))
  .add('with groups', () => {
    const model = {
      value1: 'First Value',
      value2: 'Second Value',
      value3: Math.PI,
      value4: {
        a: 123
      }
    };
    return <StateFullForm
      initialState={{ model }}>
      <InputField name={'value1'} inner={{ label: 'Value 1' }}/>
      <InputField name={'value2'} inner={{ label: 'Value 2' }}/>
      <InputField name={'value3'} inner={{ label: 'Value 3', type: 'number' }}/>
      <FieldGroup name={'value4'}>
        <InputField name={'a'} inner={{ label: 'value4 => a' }}/>
      </FieldGroup>
    </StateFullForm>;
  })
  .add('with Arrays', () => {
    const model = {
      value1: '123',
      array1: [
        { item1: 'item1', item2: 'item2' }
      ],
    };
    return <StateFullForm
      initialState={{ model }}>
      <InputField name={'value1'} inner={{ label: 'Value 1' }}/>
      <FieldArray name={'array1'} render={({ addItem }) => (
        <>
        <FieldArrayItems render={({ remove }) => (
          <div>
            <InputField name={'item1'} inner={{ label: 'Item 1' }}/>
            <InputField name={'item2'} inner={{ label: 'Item 2' }}/>
            <button type="button" onClick={remove}>Remove</button>
          </div>
        )}/>
        <button type="button" onClick={() => addItem({ item1: 'new', item2: 'new' })}>Add</button>
        </>
      )}/>
    </StateFullForm>;
  })
  .add('with Validation', () => {
    const model = {
      value1: 'First Value',
      value2: 'Second Value',
      value3: Math.PI,
      value4: {
        a: 123
      }
    };
    type Model = typeof model;
    const validation: ValidationDefinition<Model> = {
      value3: ({ value }) => value > 100 ? null : 'Value has to be greater than 100',
    };
    return <StateFullForm initialState={{ model }} validation={validation as any}>
      <InputField name={'value1'} inner={{ label: 'Value 1' }}/>
      <InputField name={'value2'} inner={{ label: 'Value 2' }}/>
      <InputField name={'value3'} inner={{ label: 'Value 3', type: 'number' }}/>
    </StateFullForm>;
  })
;
