import * as React from 'react';
import { useCallback } from 'react';
import { cleanup, fireEvent, render } from 'react-testing-library';
import { FieldArray, FieldArrayItems, FieldArrayItemsRender, FieldArrayRender, FieldGroup } from '.';
import { InputField, InputFieldProps } from '../../testUtils/InputField';
import { useFormState } from '../hooks/useFormState';
import { ArrayValidation, ValidationDefinition, ValidationFunction } from '../validation';
import { Form, FormProps } from './Form';

afterEach(cleanup);

describe('Form', () => {
  interface Model {
    name: string;
    country: string;
    address: {
      street: string;
    };
    children: Model[];
  }

  const defaultModel: Model = {
    name: '',
    country: '',
    address: {
      street: ''
    },
    children: []
  };

  interface TestComponentProps {
    initialModel: Model;
    formProps?: Partial<FormProps<Model>>;
    onModelChange?: (model: Model) => void;
    showErrorIfDirty?: boolean;
  }

  function ModelFields(inputProps: Partial<InputFieldProps>) {
    const renderChildItem: FieldArrayItemsRender<Model> = useCallback(({ remove }) => (
      <div>
        <ModelFields {...inputProps}/>
        <button type="button" onClick={remove}>Remove</button>
      </div>
    ), [inputProps]);

    const renderChildren: FieldArrayRender<Model> = useCallback(({ addItem }) => (
      <>
        <FieldArrayItems render={renderChildItem}/>
        <button type="button" onClick={() => addItem(defaultModel)}>Add Child</button>
      </>
    ), [renderChildItem]);

    return (
      <>
        <InputField label="Name" name="name" {...inputProps}/>
        <InputField label="Country" name="country" {...inputProps}/>
        <FieldGroup name="address">
          <InputField label="Street" name="street" {...inputProps}/>
        </FieldGroup>
        <FieldArray name="children" render={renderChildren}/>
      </>
    );
  }

  function TestComponent({
    initialModel,
    formProps = {},
    onModelChange: handleModelChange,
    showErrorIfDirty
  }: TestComponentProps) {
    const [form, setForm] = useFormState<Model>(initialModel);
    handleModelChange && handleModelChange(form.model);
    const inputProps: Partial<InputFieldProps> = {
      showErrorIfDirty
    };

    return (
      <Form
        state={form}
        onChange={newForm => {
          setForm(newForm);
        }}
        {...formProps}
      >
        <ModelFields {...inputProps}/>
        <button type="submit">Submit</button>
      </Form>
    );
  }

  it('should render values', () => {
    const { getByLabelText, getAllByLabelText } = render(<TestComponent
      initialModel={{
        name: 'Paul',
        country: 'Germany',
        address: {
          street: 'Sesamstreet'
        },
        children: [
          {
            ...defaultModel,
            name: 'Kristine',
            address: {
              street: 'Other Street'
            }
          }
        ]
      }}
    />);

    expect(getByLabelText('Name')).toMatchObject({ value: 'Paul' });
    expect(getByLabelText('Country')).toMatchObject({ value: 'Germany' });
    expect(getByLabelText('Street')).toMatchObject({ value: 'Sesamstreet' });
    expect(getAllByLabelText('Name')[1]).toMatchObject({ value: 'Kristine' });
    expect(getAllByLabelText('Country')[1]).toMatchObject({ value: '' });
    expect(getAllByLabelText('Street')[1]).toMatchObject({ value: 'Other Street' });
  });

  it('should update values if input changes', () => {
    const handleModelChange = jest.fn();
    const {
      getByLabelText,
      getAllByLabelText,
      getByText
    } = render(<TestComponent
      initialModel={{
        ...defaultModel,
        name: '',
        country: ''
      }}
      onModelChange={handleModelChange}
    />);

    fireInputEvent(getByLabelText('Name'), 'Christian');
    fireInputEvent(getByLabelText('Country'), 'Spain');
    fireInputEvent(getByLabelText('Street'), 'Street1');
    fireEvent.click(getByText('Add Child'));
    fireInputEvent(getAllByLabelText('Name')[1], 'Child1');
    fireInputEvent(getAllByLabelText('Country')[1], 'England');
    fireInputEvent(getAllByLabelText('Street')[1], 'Street2');

    expect(handleModelChange).toHaveBeenCalledWith({
      name: 'Christian',
      country: 'Spain',
      address: {
        street: 'Street1'
      },
      children: [
        {
          name: 'Child1',
          country: 'England',
          children: [],
          address: {
            street: 'Street2'
          }
        }
      ]
    });

    fireEvent.click(getByText('Remove'));

    expect(handleModelChange).toHaveBeenCalledWith({
      name: 'Christian',
      country: 'Spain',
      address: {
        street: 'Street1'
      },
      children: []
    });
  });

  it('should call submit', () => {
    const props: Partial<FormProps<Model>> = {
      onSubmit: jest.fn(),
    };
    const { getByText } = render(<TestComponent
      initialModel={defaultModel}
      formProps={props}
    />);

    fireEvent.click(getByText('Submit'));

    expect(props.onSubmit).toHaveBeenCalled();
  });

  describe('Validation', () => {
    const minLengthErrorMessage = 'The value has to have more characters';
    const minLength = (length: number): ValidationFunction<{ length: number }> => value => value.length < length
      ? minLengthErrorMessage
      : null;

    const validation: ValidationDefinition<Model> = {
      name: minLength(3),
      address: {
        street: minLength(3)
      },
      children: new ArrayValidation<Model[]>(
        {
          name: minLength(4)
        },
        minLength(1)
      )
    };

    it('should call invalidSubmit if invalid', () => {
      const props: Partial<FormProps<Model>> = {
        validation,
        onSubmit: jest.fn(),
        onValidSubmit: jest.fn(),
        onInValidSubmit: jest.fn()
      };
      const { getByText } = render(<TestComponent
        initialModel={defaultModel}
        formProps={props}
      />);

      fireEvent.click(getByText('Submit'));

      expect(props.onSubmit).toHaveBeenCalled();
      expect(props.onValidSubmit).not.toHaveBeenCalled();
      expect(props.onInValidSubmit).toHaveBeenCalled();
    });

    it('should call validSubmit if valid', () => {
      const props: Partial<FormProps<Model>> = {
        validation,
        onSubmit: jest.fn(),
        onValidSubmit: jest.fn(),
        onInValidSubmit: jest.fn()
      };
      const { getByText } = render(<TestComponent
        initialModel={{
          ...defaultModel,
          name: '123',
          address: {
            street: '123'
          },
          children: [
            {
              ...defaultModel,
              name: '1234'
            }
          ]
        }}
        formProps={props}
      />);

      fireEvent.click(getByText('Submit'));

      expect(props.onSubmit).toHaveBeenCalled();
      expect(props.onValidSubmit).toHaveBeenCalled();
      expect(props.onInValidSubmit).not.toHaveBeenCalled();
    });

    it('should not display error if not touched', () => {
      const props: Partial<FormProps<Model>> = {
        validation
      };
      const { queryByText } = render(<TestComponent
        initialModel={defaultModel}
        formProps={props}
      />);

      expect(queryByText(minLengthErrorMessage)).toBeNull();
    });

    it('should display error if touched', () => {
      const props: Partial<FormProps<Model>> = {
        validation
      };
      const { getByLabelText, getAllByLabelText, getByText, debug } = render(<TestComponent
        initialModel={{
          ...defaultModel,
          children: [
            defaultModel
          ]
        }}
        formProps={props}
      />);
      const nameInput = getAllByLabelText('Name')[0];
      const streetInput = getAllByLabelText('Street')[0];
      const childNameInput = getAllByLabelText('Name')[1];

      fireEvent.blur(nameInput);

      expect(nameInput.parentNode).toHaveTextContent(minLengthErrorMessage);
      expect(streetInput.parentNode).not.toHaveTextContent(minLengthErrorMessage);
      expect(childNameInput.parentNode).not.toHaveTextContent(minLengthErrorMessage);

      // Submit touches all
      fireEvent.click(getByText('Submit'));

      expect(nameInput.parentNode).toHaveTextContent(minLengthErrorMessage);
      expect(streetInput.parentNode).toHaveTextContent(minLengthErrorMessage);
      expect(childNameInput.parentNode).toHaveTextContent(minLengthErrorMessage);
    });

    it('should display error if dirty and option is set', () => {
      const props: Partial<FormProps<Model>> = {
        validation
      };
      const { queryByText, getByLabelText } = render(<TestComponent
        initialModel={{
          ...defaultModel,
          name: '',
          country: ''
        }}
        formProps={props}
        showErrorIfDirty={true}
      />);

      fireEvent.input(getByLabelText('Name'), { target: { value: '1' } });

      expect(queryByText(minLengthErrorMessage)).not.toBeNull();
    });

    it('should not display error if error is fixed', () => {
      const props: Partial<FormProps<Model>> = {
        validation
      };
      const { getByLabelText } = render(<TestComponent
        initialModel={defaultModel}
        formProps={props}
      />);
      const nameInput = getByLabelText('Name');

      fireEvent.blur(nameInput);

      expect(nameInput.parentNode).toHaveTextContent(minLengthErrorMessage);

      fireInputEvent(nameInput, '123');

      expect(nameInput.parentNode).not.toHaveTextContent(minLengthErrorMessage);
    });
  });
});

function fireInputEvent(element: Element, value: any) {
  return fireEvent.input(element, { target: { value } });
}
