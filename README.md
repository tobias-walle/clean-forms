# React Clean Forms

[![Build Status](https://travis-ci.org/TobiasWalle/clean-forms.svg?branch=master)](https://travis-ci.org/TobiasWalle/clean-forms)
[![Coverage Status](https://coveralls.io/repos/github/TobiasWalle/clean-forms/badge.svg?branch=master)](https://coveralls.io/github/TobiasWalle/clean-forms?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm version](https://badge.fury.io/js/clean-forms.svg)](https://badge.fury.io/js/clean-forms)


**This project is inactive and shouldn't be used anymore. I recommend the use of [Formik](https://formik.org/) instead.**


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
import React, { useState } from 'react';
import { Form } from 'clean-forms';
import { InputField } from './InputField';

const initialValue = {
  username: '',
  password: '',
};

export function LoginForm() {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = () => {
    alert(JSON.stringify(value, null, 2));
  };

  return (
    <Form value={value} onChange={setValue} onSubmit={handleSubmit}>
      <InputField label="Username" name="username" />
      <InputField label="Password" name="password" type="password" />
      <div>
        <button type="submit">Submit</button>
      </div>
    </Form>
  );
}
```

That's it! We created a simple login form. 

## Validation
Currently the user can 
submit even if he leaves some of the fields empty.

First let's create a function, that checks if the value is set.
If this is the case it should return null and an error message otherwise.

```typescript
// validators.ts
export function required(value: any) {
  if (value == null || value === '') {
    return 'Required';
  }
  return null;
}
```

We also need to update our field, so it displays validation errors.
We don't want to show these errors at the beginning, as this would be
overwhelming for the user. Instead we only want to show the error
if the user has focused the field. We can use the `touched` flag for this.


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
    input: { value, name, onChange, onBlur, error, touched },
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
        {touched && <div>{error}</div>}
      </div>
    );
  }
);
```

Now we can use our validator in our form.

```typescript jsx
// LoginForm.tsx
import React, { useState, useCallback } from 'react';
import { Form, ValidationDefinition } from 'clean-forms';
import { InputField } from './InputField';
import { required } from './validators';


const initialValue = {
  username: '',
  password: '',
};

// We define the validation here
const validation: ValidationDefinition<typeof initialValue> = {
  username: required,
  password: required,
};

export function LoginForm() {
  const [value, setValue] = useState(value);

  const handleSubmit = () => {
    alert(JSON.stringify(value, null, 2));
  };

  return (
    <Form
      state={value}
      onChange={setValue}
      // and just pass it to our form
      validation={validation}
      // We only want to trigger the submit on a valid form
      onValidSubmit={handleSubmit}
    >
      <InputField label="Username" name="username" />
      <InputField label="Password" name="password" type="password" />
      <div>
        <button type="submit">Submit</button>
      </div>
    </Form>
  );
}
```

The validation definition has the same shape as our data. If you use typescript
you get a type error if your definition does not match. We also change the callback
from `onSubmit` to `onValidSubmit`, so it only gets triggered if our form is valid.

You can checkout the example on [Code Sandbox](https://codesandbox.io/s/2p692n3y2r).
