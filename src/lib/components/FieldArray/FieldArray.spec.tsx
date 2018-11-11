import { mount } from 'enzyme';
import * as React from 'react';
import { withFormContext } from '../../../testUtils/context';
import { mockFormContext } from '../../../testUtils/mockFormContext';
import { FieldArrayContext } from '../../contexts/field-array-context';
import { FieldGroupContext, FieldGroupContextValue } from '../../contexts/field-group-context';
import { OnFieldChange, OnFieldMount } from '../../contexts/form-context';
import { FieldArray } from './FieldArray';

describe('FieldArray', () => {
  it('should pass Context', () => {
    const model = { array: ['item'] };
    const context = mockFormContext(model);
    const renderWithContext = jest.fn(() => <div/>);

    mount(
      withFormContext(context)(
        <FieldArray name={'array'} render={() => (
          <FieldGroupContext.Consumer>
            {renderWithContext}
          </FieldGroupContext.Consumer>
        )}/>
      )
    );
    const expectedContext: FieldGroupContextValue = {
      namespace: 'array',
      path: 'array',
    };

    expect(renderWithContext).toHaveBeenCalledWith(expectedContext);
  });

  it('should pass "addItem" to render function', () => {
    const model = { array: ['item'] };
    type Model = typeof model;
    const onFieldChange: OnFieldChange<Model> = jest.fn();
    const context = mockFormContext<Model>(model, { onFieldChange });

    const element = mount(
      withFormContext(context)(
        <FieldArray name={'array'} render={({ addItem }) => (
          <button onClick={() => addItem('newItem')}>Add</button>
        )}/>
      )
    );
    const firstButton = element.find('button').first();
    firstButton.simulate('click');

    expect(onFieldChange).toHaveBeenCalledWith('array', 'array', ['item', 'newItem']);
  });

  it('should pass "items" to render function', () => {
    const model = { array: ['item'] };
    type Model = typeof model;
    const context = mockFormContext<Model>(model);
    const render = jest.fn(() => <div/>);

    mount(
      withFormContext(context)(
        <FieldArray name={'array'} render={render}/>
      )
    );

    expect(render.mock.calls[0][0]).toMatchObject({
      items: ['item']
    });
  });

  it('should register field on mount', () => {
    const model = { array: ['item'] };
    type Model = typeof model;
    const onFieldMount: OnFieldMount = jest.fn();
    const context = mockFormContext<Model>(model, { onFieldMount });

    mount(
      withFormContext(context)(
        <FieldArray name={'array'} render={() => (<div/>)}/>
      )
    );

    expect(onFieldMount).toHaveBeenCalledWith('array');
  });

  it('should provide getKey as context', () => {
    const model = { array: ['item'] };
    type Model = typeof model;
    const context = mockFormContext<Model>(model);
    const getKey = jest.fn(() => '');

    const renderContext = jest.fn(() => <div/>);

    mount(
      withFormContext(context)(
        <FieldArray name={'array'} getKey={getKey} render={() => (
          <FieldArrayContext.Consumer>
            {renderContext}
          </FieldArrayContext.Consumer>
        )}/>
      )
    );

    expect(renderContext).toHaveBeenCalledWith({ getKey });
  });
});
