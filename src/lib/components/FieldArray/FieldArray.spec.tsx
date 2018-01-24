import { mount } from 'enzyme';
import * as React from 'react';
import { FieldGroupContext, fieldGroupContextTypes } from '../FieldGroup/FieldGroup';
import { FormContext, OnValueChange } from '../Form/Form';
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
    const onValueChange: OnValueChange<Model> = jest.fn();
    const context: FormContext<Model> = { model, onValueChange };

    const element = mount(
      <FieldArray name={'array'} render={() => (
        <MyComponent/>
      )}/>
      , { context }
    );
    const expectedContext: FieldGroupContext = {
      groups: ['array']
    };

    const myComponent: MyComponent = element.find(MyComponent).instance() as any;

    expect(myComponent.context).toEqual(expectedContext);
  });

  it('should pass "addItem" to render function', () => {
    const model = { array: ['item'] };
    type Model = typeof model;
    const onValueChange: OnValueChange<Model> = jest.fn();
    const context: FormContext<Model> = { model, onValueChange };

    const element = mount(
      <FieldArray name={'array'} render={({addItem}) => (
        <button onClick={() => addItem('newItem')}>Add</button>
      )}/>
      , { context }
    );
    const firstButton = element.find('button').first();
    firstButton.simulate('click');

    expect(onValueChange).toHaveBeenCalledWith(['array'], ['item', 'newItem']);
  });
});
