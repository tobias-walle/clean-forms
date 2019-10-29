import React, { useCallback, useState } from 'react';
import { FieldArray, FieldArrayItems, FieldGroup, Form } from '../lib/components';
import { ValidationDefinition } from '../lib/validation';
import { InputField } from './InputField';
import { required } from './validators';

const initialValue = {
  username: '',
  password: '',
  inner: {
    hello: '',
  },
  items: [
    { a: '' },
    { a: '' },
    { a: '' },
    { a: '' },
    { a: '' },
  ],
};

const validation: ValidationDefinition<typeof initialValue> = {
  username: required,
  password: required,
};

export function LoginForm() {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = () => {
    alert(JSON.stringify(value, null, 2));
  };

  const renderFieldArrayItem = useCallback(() => (
    <Logger name="FieldArrayItems">
      <InputField label="A" name="a"/>
    </Logger>
  ), []);

  const renderFieldArray = useCallback(() => (
    <Logger name="FieldArray">
      <FieldArrayItems
        render={renderFieldArrayItem}
      />
    </Logger>
  ), [renderFieldArrayItem]);

  return (
    <Form
      value={value}
      onChange={setValue}
      onValidSubmit={handleSubmit}
      validation={validation}
    >
      <Logger name="Form">
        <>
          <InputField label="Username" name="username"/>
          <InputField label="Password" name="password" type="password"/>
          <FieldGroup name="inner">
            <Logger name="FieldGroup">
              <InputField label="Hello" name="hello"/>
            </Logger>
          </FieldGroup>
          <FieldArray
            name="items"
            render={renderFieldArray}
          />
        </>
      </Logger>
    </Form>
  );
}

function Logger(props: { name: string, children: React.ReactElement }) {
  console.info('R', props.name);
  return props.children;
}
