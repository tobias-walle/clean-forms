import React, { useState } from 'react';
import { Form } from '../lib/components';
import { ValidationDefinition } from '../lib/validation';
import { InputField } from './InputField';
import { required } from './validators';

const initialValue = {
  username: '',
  password: '',
};

const validation: ValidationDefinition<typeof initialValue> = {
  username: required,
  password: required,
};

export function LoginForm() {
  const [formState, setFormState] = useState({
    model: initialValue,
  });

  const handleSubmit = () => {
    alert(JSON.stringify(formState.model, null, 2));
  };

  return (
    <Form
      state={formState}
      onChange={setFormState}
      onValidSubmit={handleSubmit}
      validation={validation}
    >
      <InputField label="Username" name="username"/>
      <InputField label="Password" name="password" type="password"/>
      <div>
        <button type="submit">Submit</button>
      </div>
    </Form>
  );
}
