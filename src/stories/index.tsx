import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { Form } from '../lib';
import { Field } from '../lib/components/Field/Field';
import { renderInput } from '../lib/components/InputField/InputField';
import { StateWrapper } from './StateWrapper/StateWrapper';

storiesOf('Form', module)
  .add('default', () => (
    <StateWrapper
      initialState={{
        model: {
          value1: 'First Value',
          value2: 'Second Value',
          value3: Math.PI,
        }
      }}
      render={({ state, setState }) => (
        <Form
          model={state.model}
          onChange={(model) => {
            action('onChange')(model);
            setState({ model });
          }}
        >
          <Field name={'value1'} render={renderInput}/>
          <Field name={'value2'} render={renderInput}/>
          <Field name={'value3'} render={renderInput} inner={{type: 'number'}}/>
        </Form>
      )}
    />
  ));
