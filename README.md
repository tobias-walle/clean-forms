# React Clean Forms

[![Build Status](https://travis-ci.org/TobiasWalle/clean-forms.svg?branch=master)](https://travis-ci.org/TobiasWalle/clean-forms)
[![Coverage Status](https://coveralls.io/repos/github/TobiasWalle/clean-forms/badge.svg?branch=master)](https://coveralls.io/github/TobiasWalle/clean-forms?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm version](https://badge.fury.io/js/clean-forms.svg)](https://badge.fury.io/js/clean-forms)

Forms can be complex and React does not provide a build-in solution to solve this
problem. This library provides components to write readable forms that focus
on maintainability.

## Features

- Input Validation
- Dirty/Touched state tracking
- Full Typescript support
- Controlled data flow

## Getting Started

In `Clean Forms` every form is composed of `Field`s. A `Field` wraps an component
to connect it to the api. Let's create a simple `Field` for an text input.
We define how the given value is rendered and updated and how errors are displayed.

```typescript jsx
// InputField.tsx
import React from 'react';
import { createField } from 'clean-forms';

interface InputFieldProps {
  label: string;
}

export const InputField = createField<
  string,
  InputFieldProps & JSX.IntrinsicElements['input']
>(
  ({
    input: { value, name, onChange, onBlur },
    custom: { label, ...other },
  }) => {
    return (
      <div>
        <input
          value={value}
          name={name}
          onChange={event => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={label}
          {...other}
        />
      </div>
    );
  }
);
```

Next, let's build our actual form! We use the "name" property on our fields to define which
value is mapped to the field.

```typescript jsx
// LoginForm.tsx
import React, { useState, useCallback } from 'react';
import { Form } from 'clean-forms';
import { InputField } from './InputField';

const initialValue = {
  username: '',
  password: '',
};

export function LoginForm() {
  const [formState, setFormState] = useState({
    model: initialValue,
  });

  const handleSubmit = () => {
    alert(JSON.stringify(formState.model, null, 2));
  };

  return (
    <Form state={formState} onChange={setFormState} onSubmit={handleSubmit}>
      <InputField label="Username" name="username" />
      <InputField label="Password" name="password" type="password" />
      <div>
        <button type="submit">Submit</button>
      </div>
    </Form>
  );
}
```

Thats it! We created a simple login form. You can checkout the example
on [Code Sandbox](https://codesandbox.io/s/2p692n3y2r).
