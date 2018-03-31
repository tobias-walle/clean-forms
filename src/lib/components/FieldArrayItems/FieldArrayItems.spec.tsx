import { mount } from 'enzyme';
import * as React from 'react';
import { FieldArrayContext } from '../';
import { InputField } from '../../../testUtils/InputField';
import { mockFormContext } from '../../../testUtils/mockFormContext';
import { DELETE } from '../../utils';
import { FieldGroupContext } from '../FieldGroup/FieldGroup';
import { FormContext, OnFieldChange } from '../Form/Form';
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
    const context: FormContext<typeof model> & FieldGroupContext & FieldArrayContext = {
      ...mockFormContext(model),
      namespace: 'array',
      path: 'array',
      getKey: (_, i) => i
    };
    const element = mount(
      <FieldArrayItems
        render={() => (
          <InputField name={'a'}/>
        )}/>
      , { context }
    );

    expect(element).toMatchSnapshot();
    expect(element.find(InputField).length).toBe(3);
  });

  it('should throw an error if getKey is missing in the contenxt', () => {
    const model = {
      array: [
        { a: 0 },
      ]
    };
    const context: FormContext<typeof model> & FieldGroupContext = {
      ...mockFormContext(model),
      namespace: 'array',
      path: 'array',
    };
    console.error = jest.fn();
    const render = () => mount(
      <FieldArrayItems
        render={() => (
          <InputField name={'a'}/>
        )}/>
      , { context }
    );

    expect(render).toThrowErrorMatchingSnapshot();
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
    const context: FormContext<Model> & FieldGroupContext & FieldArrayContext = {
      ...mockFormContext(model, { onFieldChange }),
      namespace: 'array',
      path: 'array',
      getKey: (_, i) => `key_${i}`
    };
    const element = mount(
      <FieldArrayItems
        render={({ remove }) => (
          <div>
            <InputField name={'a'}/>
            <button onClick={remove}>Remove</button>
          </div>
        )}/>
      , { context }
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
    const context: FormContext<Model> & FieldGroupContext & FieldArrayContext = {
      ...mockFormContext(model, { onFieldChange }),
      namespace: 'array',
      path: 'array',
      getKey: (_, i) => i
    };
    const renderItem = jest.fn(() => <div/>);
    mount(
      <FieldArrayItems
        render={renderItem}/>
      , { context }
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
    const context: FormContext<Model> & FieldGroupContext & FieldArrayContext = {
      ...mockFormContext(model, { onFieldChange }),
      namespace: 'array',
      path: 'array',
      getKey: (_, i) => i
    };
    const renderItem = jest.fn(() => <div/>);
    mount(
      <FieldArrayItems
        render={renderItem}/>
      , { context }
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
    const context: FormContext<Model> & FieldGroupContext & FieldArrayContext = {
      ...mockFormContext(model, { onFieldChange }),
      namespace: 'array',
      path: 'array',
      getKey: (_, i) => i
    };
    const element = mount(
      <FieldArrayItems
        render={({ setArray }) => (
          <div>
            <InputField name={'a'}/>
            <button onClick={() => setArray([])}>Remove</button>
          </div>
        )}/>
      , { context }
    );

    element.find('button').first().simulate('click');

    expect(onFieldChange).toHaveBeenCalledWith('array', 'array', []);
  });
});
