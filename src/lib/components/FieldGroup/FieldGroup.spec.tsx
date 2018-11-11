import { mount } from 'enzyme';
import * as React from 'react';
import { FieldGroupContext, FieldGroupContextValue } from '../../contexts/field-group-context';
import { FieldGroup } from './FieldGroup';

describe('FieldGroup', () => {
  it('should provide context to child', () => {
    const renderWithContext = jest.fn();
    mount(<FieldGroup name={'group'}>
      <FieldGroupContext.Consumer>{renderWithContext}</FieldGroupContext.Consumer>
    </FieldGroup>);

    const expected: FieldGroupContextValue = {
      namespace: 'group',
      path: 'group'
    };
    expect(renderWithContext).toHaveBeenCalledWith(expected);
  });

  it('should work with nested groups', () => {
    const renderWithContext = jest.fn();
    mount(
      <FieldGroup name={'group1'}>
        <FieldGroup name={'group2'}>
          <FieldGroup name={'group3'}>
            <FieldGroupContext.Consumer>{renderWithContext}</FieldGroupContext.Consumer>
          </FieldGroup>
        </FieldGroup>
      </FieldGroup>
    );

    const expected: FieldGroupContextValue = {
      namespace: 'group1.group2.group3',
      path: 'group1.group2.group3'
    };
    expect(renderWithContext).toHaveBeenCalledWith(expected);
  });
});
