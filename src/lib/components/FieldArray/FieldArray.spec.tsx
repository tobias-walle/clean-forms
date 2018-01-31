import { mount } from 'enzyme';
import * as React from 'react';
import { mockFormContext } from '../../../testUtils/mockFormContext';
import { FieldGroupContext, fieldGroupContextTypes } from '../FieldGroup/FieldGroup';
import { FormContext, OnFieldChange, OnFieldMount } from '../Form/Form';
import { FieldArray } from './FieldArray';

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

  it('should register field on mount', () => {
    const model = { array: ['item'] };
    type Model = typeof model;
    const onFieldMount: OnFieldMount = jest.fn();
    const context: FormContext<Model> = mockFormContext(model, { onFieldMount });

    mount(<FieldArray name={'array'} render={() => (<div/>)}/>, { context });

    expect(onFieldMount).toHaveBeenCalledWith('array');
  });
});
