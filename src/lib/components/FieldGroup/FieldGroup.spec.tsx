import { mount, shallow } from 'enzyme';
import { ReactElement } from 'react';
import * as React from 'react';
import { FieldGroup, FieldGroupContext, fieldGroupContextTypes } from './FieldGroup';

class Child extends React.Component<{}, {}> {
  public static contextTypes = fieldGroupContextTypes;
  public context: FieldGroupContext;

  public render() {
    return <div>Child</div>;
  }
}

describe('FieldGroup', () => {
  it('should provide context to child', () => {
    const element = mount(<FieldGroup name={'group'}><Child/></FieldGroup>);

    const child: Child = element.find(Child).instance() as any;

    expect(child.context).toEqual({
      groups: ['group']
    });
  });

  it('should work with nested groups', () => {
    const element = mount(
      <FieldGroup name={'group1'}>
        <FieldGroup name={'group2'}>
          <FieldGroup name={'group3'}>
            <Child/>
          </FieldGroup>
        </FieldGroup>
      </FieldGroup>
    );

    const child: Child = element.find(Child).instance() as any;

    expect(child.context).toEqual({
      groups: ['group1', 'group2', 'group3']
    });
  });
});
