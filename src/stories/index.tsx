import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { Form } from '../lib';
import { FieldGroup } from '../lib/components';
import { ValidationFunction } from '../lib/utils/validation';
import { Input } from './components/Input';
import { MyForm } from './example';
import { StateFullForm } from './StateFullForm/StateFullForm';

const required: ValidationFunction<any> = ({value}) => value === '' || value == null
  ? 'The field is required'
  : null;

storiesOf('Form', module)
  .add('default', () => (
    <StateFullForm
      initialState={{
        model: {
          username: '',
          name: {
            first: '',
            second: '',
          },
          age: null,
          password: '',
        }
      }}
      validation={{
        username: required,
        name: {
          first: required,
          second: required,
        },
        age: required,
        password: required,
      }}
    >
      <FieldGroup name={'name'}>
        <Input name={'first'} label={'First Name'}/>
        <Input name={'second'} label={'Second Name'}/>
      </FieldGroup>
      <Input name={'age'} label={'Age'} type={'number'}/>
      <Input name={'username'} label={'Username'}/>
      <Input name={'password'} label={'Password'}/>
      <button>Submit</button>
    </StateFullForm>
  ))
  .add('example', () => <MyForm/>)
;
