import { shallow } from 'enzyme';
import * as React from 'react';
import { Form } from './Form';

describe('Form', () => {
  it('should render', () => {
    expect(shallow(<Form/>)).toMatchSnapshot();
  });
});
