import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Form } from './Form';
import { InputField } from './InputField';

interface TestComponentProps {
  onValueChange: (value: { name: string }) => void;
  onBlur?: () => void;
}

function TestComponent({ onValueChange, onBlur }: TestComponentProps) {
  const [value, setValue] = useState({
    name: 'test',
  });

  useEffect(() => onValueChange(value), [onValueChange, value]);

  return (
    <Form value={value} onChange={setValue}>
      <InputField name="name" onBlur={onBlur} placeholder="Name" />
    </Form>
  );
}

describe('InputField', () => {
  it('should work with Form', () => {
    const onValueChange = jest.fn();
    const onBlur = jest.fn();
    const { getByPlaceholderText } = render(
      <TestComponent onValueChange={onValueChange} onBlur={onBlur} />
    );

    expect(onValueChange).toHaveBeenLastCalledWith({
      name: 'test',
    });

    const nameField = getByPlaceholderText('Name');
    fireInputEvent(nameField, 'Some Text');

    expect(onValueChange).toHaveBeenLastCalledWith({
      name: 'Some Text',
    });
  });

  it('should pass events', () => {
    const onValueChange = jest.fn();
    const onBlur = jest.fn();
    const { getByPlaceholderText } = render(
      <TestComponent onValueChange={onValueChange} onBlur={onBlur} />
    );

    const nameField = getByPlaceholderText('Name');
    fireEvent.blur(nameField);

    expect(onBlur).toHaveBeenCalled();
  });
});

function fireInputEvent(element: Element, value: any) {
  return fireEvent.input(element, { target: { value } });
}
