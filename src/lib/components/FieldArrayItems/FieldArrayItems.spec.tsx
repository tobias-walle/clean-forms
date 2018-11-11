import { mount, render } from 'enzyme';
import * as React from 'react';
import { withArrayContext, withFormContext, withGroupContext } from '../../../testUtils/context';
import { InputField } from '../../../testUtils/InputField';
import { mockFormContext } from '../../../testUtils/mockFormContext';
import { FieldArrayContextValue } from '../../contexts/field-array-context';
import { FieldGroupContextValue } from '../../contexts/field-group-context';
import { FormContextValue, OnFieldChange } from '../../contexts/form-context';
import { DELETE } from '../../utils';
import { FieldArrayItems } from './FieldArrayItems';

describe('FieldArrayItems', () => {
  it('should render items', () => {
    const model = {
      array: [
        { a: 0 },
        { a: 1 },
        { a: 2 },
      ]
    };
    const formContext: FormContextValue<typeof model> = mockFormContext(model);
    const groupContext: FieldGroupContextValue = {
      namespace: 'array',
      path: 'array',
    };
    const arrayContext: FieldArrayContextValue = {
      getKey: (_, i) => i
    };
    const element = render(
      withFormContext(formContext)(
        withGroupContext(groupContext)(
          withArrayContext(arrayContext)(
            <FieldArrayItems render={() => <InputField name={'a'}/>}/>
          )
        )
      )
    );

    expect(element).toMatchSnapshot();
  });

  it('should pass remove callback to render function', () => {
    const model = {
      array: [
        { a: 0 },
        { a: 1 },
        { a: 2 },
      ]
    };
    type Model = typeof model;
    const onFieldChange: OnFieldChange<Model> = jest.fn();
    const formContext: FormContextValue<typeof model> = mockFormContext(model, { onFieldChange });
    const groupContext: FieldGroupContextValue = {
      namespace: 'array',
      path: 'array',
    };
    const arrayContext: FieldArrayContextValue = {
      getKey: (_, i) => `key_${i}`
    };
    const element = mount(
      withFormContext(formContext)(
        withGroupContext(groupContext)(
          withArrayContext(arrayContext)(
            <FieldArrayItems
              render={({ remove }) => (
                <div>
                  <InputField name={'a'}/>
                  <button onClick={remove}>Remove</button>
                </div>
              )}/>
          )
        )
      )
    );

    element.find('button').first().simulate('click');

    expect(onFieldChange).toHaveBeenCalledWith('array.key_0', 'array.0', DELETE);
  });

  it('should pass item to render function', () => {
    const item = { a: 0 };
    const model = {
      array: [item]
    };
    type Model = typeof model;
    const onFieldChange: OnFieldChange<Model> = jest.fn();
    const formContext: FormContextValue<typeof model> = mockFormContext(model, { onFieldChange });
    const groupContext: FieldGroupContextValue = {
      namespace: 'array',
      path: 'array',
    };
    const arrayContext: FieldArrayContextValue = {
      getKey: (_, i) => i
    };
    const renderItem = jest.fn(() => <div/>);
    mount(
      withFormContext(formContext)(
        withGroupContext(groupContext)(
          withArrayContext(arrayContext)(
            <FieldArrayItems render={renderItem}/>
          )
        )
      )
    );

    expect(renderItem).toHaveBeenCalledTimes(1);
    expect(renderItem.mock.calls[0][0].item).toBe(item);
  });

  it('should pass index to render function', () => {
    const model = {
      array: [{ a: 0 }, { a: 1 }]
    };
    type Model = typeof model;
    const onFieldChange: OnFieldChange<Model> = jest.fn();
    const formContext: FormContextValue<typeof model> = mockFormContext(model, { onFieldChange });
    const groupContext: FieldGroupContextValue = {
      namespace: 'array',
      path: 'array',
    };
    const arrayContext: FieldArrayContextValue = {
      getKey: (_, i) => i
    };
    const renderItem = jest.fn(() => <div/>);
    mount(
      withFormContext(formContext)(
        withGroupContext(groupContext)(
          withArrayContext(arrayContext)(
            <FieldArrayItems render={renderItem}/>
          )
        )
      )
    );

    expect(renderItem).toHaveBeenCalledTimes(2);
    expect(renderItem.mock.calls[0][0].index).toBe(0);
    expect(renderItem.mock.calls[1][0].index).toBe(1);
  });

  it('should pass setArray callback to render function', () => {
    const model = {
      array: [
        { a: 0 },
        { a: 1 },
        { a: 2 },
      ]
    };
    type Model = typeof model;
    const onFieldChange: OnFieldChange<Model> = jest.fn();
    const formContext: FormContextValue<typeof model> = mockFormContext(model, { onFieldChange });
    const groupContext: FieldGroupContextValue = {
      namespace: 'array',
      path: 'array',
    };
    const arrayContext: FieldArrayContextValue = {
      getKey: (_, i) => i
    };
    const element = mount(
      withFormContext(formContext)(
        withGroupContext(groupContext)(
          withArrayContext(arrayContext)(
            <FieldArrayItems
              render={({ setArray }) => (
                <div>
                  <InputField name={'a'}/>
                  <button onClick={() => setArray([])}>Remove</button>
                </div>
              )}/>
          )
        )
      )
    );

    element.find('button').first().simulate('click');

    expect(onFieldChange).toHaveBeenCalledWith('array', 'array', []);
  });
});
