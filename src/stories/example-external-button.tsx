import React, { useRef, useState } from 'react';
import { FieldGroup, Form, FormState } from '../lib';
import { Input } from './example';

interface Model {
  username: string;
  password: string;
  realName: {
    first: string;
    last: string;
  };
}

export const MyFormWithExternalButton = () => {
  const [state, setState] = useState<FormState<Model>>({
    model: {
      username: '',
      password: '',
      realName: {
        first: '',
        last: '',
      }
    }
  });
  const formRef = useRef<Form<any>>(null);
  return (
    <>
      <Form
        state={state}
        onChange={setState}
        onValidSubmit={() => alert('Submit Successful')}
        ref={formRef}
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
      <div>
        <button onClick={() => formRef.current && formRef.current.submit()}>Submit outside of form</button>
      </div>
    </>
  );
};
