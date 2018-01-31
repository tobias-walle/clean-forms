import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { InputField } from '../';
import { mockFormContext } from '../../../testUtils/mockFormContext';
import { DELETE } from '../../utils';
import { FieldGroupContext } from '../FieldGroup/FieldGroup';
import { FormContext, OnFieldChange } from '../Form/Form';
import { FieldArrayItems, FieldArrayItemsRender } from './FieldArrayItems';

describe('FieldArrayItems', () => {
  it('should render items', () => {
    const model = {
      array: [
        { a: 0 },
        { a: 1 },
        { a: 2 },
      ]
    };
    const context: FormContext<typeof model> & FieldGroupContext = {
      ...mockFormContext(model),
      namespace: 'array',
      path: 'array',
    };
    const element = mount(
      <FieldArrayItems
        getKey={(_, i) => i}
        render={() => (
          <InputField name={'a'}/>
        )}/>
      , { context }
    );

    expect(element).toMatchSnapshot();
    expect(element.find(InputField).length).toBe(3);
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
    const context: FormContext<Model> & FieldGroupContext = {
      ...mockFormContext(model, { onFieldChange }),
      namespace: 'array',
      path: 'array',
    };
    const element = mount(
      <FieldArrayItems
        getKey={(_, i) => `key_${i}`}
        render={({remove}) => (
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
    const context: FormContext<Model> & FieldGroupContext = {
      ...mockFormContext(model, { onFieldChange }),
      namespace: 'array',
      path: 'array',
    };
    const element = mount(
      <FieldArrayItems
        getKey={(_, i) => i}
        render={({setArray}) => (
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
