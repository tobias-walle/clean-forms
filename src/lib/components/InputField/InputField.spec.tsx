import { shallow } from 'enzyme';
import * as React from 'react';
import { InputField } from './InputField';

describe('InputField', () => {
  it('should render', () => {
    expect(shallow(<InputField name={'name'}/>)).toMatchSnapshot();
  });
});
