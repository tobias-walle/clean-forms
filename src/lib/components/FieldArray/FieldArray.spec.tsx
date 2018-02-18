import { mount } from 'enzyme';
import * as React from 'react';
import { mockFormContext } from '../../../testUtils/mockFormContext';
import { FieldGroupContext, fieldGroupContextTypes } from '../FieldGroup/FieldGroup';
import { FormContext, OnFieldChange, OnFieldMount } from '../Form/Form';
import { FieldArray, FieldArrayContext, fieldArrayContextTypes } from './FieldArray';

describe('FieldArray', () => {
  it('should pass Context', () => {
    class MyComponent extends React.Component<{}, {}> {
      public static contextTypes = fieldGroupContextTypes;
      public context: FieldGroupContext;

      public render() {
        return <div/>;
      }
    }

    const model = { array: ['item'] };
    type Model = typeof model;
    const context: FormContext<Model> = mockFormContext(model);

    const element = mount(
      <FieldArray name={'array'} render={() => (
        <MyComponent/>
      )}/>
      , { context }
    );
    const expectedContext: FieldGroupContext = {
      namespace: 'array',
      path: 'array',
    };

    const myComponent: MyComponent = element.find(MyComponent).instance() as any;

    expect(myComponent.context).toEqual(expectedContext);
  });

  it('should pass "addItem" to render function', () => {
    const model = { array: ['item'] };
    type Model = typeof model;
    const onFieldChange: OnFieldChange<Model> = jest.fn();
    const context: FormContext<Model> = mockFormContext(model, { onFieldChange });

    const element = mount(
      <FieldArray name={'array'} render={({ addItem }) => (
        <button onClick={() => addItem('newItem')}>Add</button>
      )}/>
      , { context }
    );
    const firstButton = element.find('button').first();
    firstButton.simulate('click');

    expect(onFieldChange).toHaveBeenCalledWith('array', 'array', ['item', 'newItem']);
  });

  it('should pass "items" to render function', () => {
    const model = { array: ['item'] };
    type Model = typeof model;
    const context: FormContext<Model> = mockFormContext(model);
    const render = jest.fn(() => <div/>);

    mount(
      <FieldArray name={'array'} render={render}/>
      , { context }
    );

    expect(render.mock.calls[0][0]).toMatchObject({
      items: ['item']
    });
  });

  it('should register field on mount', () => {
    const model = { array: ['item'] };
    type Model = typeof model;
    const onFieldMount: OnFieldMount = jest.fn();
    const context: FormContext<Model> = mockFormContext(model, { onFieldMount });

    mount(<FieldArray name={'array'} render={() => (<div/>)}/>, { context });

    expect(onFieldMount).toHaveBeenCalledWith('array');
  });

  it('should provide getKey as context', () => {
    const model = { array: ['item'] };
    type Model = typeof model;
    const context: FormContext<Model> = mockFormContext(model);
    const getKey = jest.fn(() => '');

    class Child extends React.Component {
      public static contextTypes = fieldArrayContextTypes;
      public context: FieldArrayContext;

      public render() {
        return <div/>;
      }
    }

    let childRef: Child | null = null;
    mount(<FieldArray name={'array'} getKey={getKey} render={() => (
      <Child ref={ref => childRef = ref}/>
    )}/>, { context });

    expect(childRef!.context).toEqual({ getKey });
  });
});
