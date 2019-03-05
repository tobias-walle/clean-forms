import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { renderInput } from '../../testUtils/InputField';
import { DEFAULT_FIELD_STATUS } from '../statusTracking';
import { emptyFunction } from '../utils/emptyFunction';
import { InputProps } from './createField';
import { createStandaloneField } from './createStandaloneField';

describe('createStandaloneField', () => {
  it(`should create a standalone field`, () => {
    const renderFn = jest.fn();
    const MyField = createStandaloneField(renderFn);
    const value = 'my-value';
    const customProps = { a: 1, b: 2 };

    shallow(<MyField value={value} {...customProps}/>);

    const expectedInput: InputProps<string> = {
      ...DEFAULT_FIELD_STATUS,
      value,
      onBlur: emptyFunction,
      onChange: emptyFunction,
      error: undefined,
      valid: true,
      invalid: false
    };
    expect(renderFn).toHaveBeenCalledWith({
      input: expectedInput,
      custom: expect.objectContaining(customProps)
    });
  });

  it('should work with input', () => {
    const Input = createStandaloneField(renderInput);

    class TestComponent extends React.Component {
      public state = {
        value: 'test'
      };

      public render() {
        return <Input
          value={this.state.value}
          onChange={value => this.setState({ value })}
        />;
      }
    }

    const wrapper = mount(<TestComponent/>);
    const input = wrapper.find('input');

    (input.instance() as any).value = 'new Value';
    input.simulate('change');

    expect(wrapper.state()).toEqual({ value: 'new Value' });
  });
});
