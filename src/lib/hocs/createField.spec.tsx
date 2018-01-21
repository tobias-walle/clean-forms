import { shallow } from 'enzyme';
import * as React from 'react';
import { Field } from '../components';
import { createField } from './createField';

describe('createField', () => {
  it(`should create an field input that doesn't need a render function`, () => {
    const InnerComponent: React.StatelessComponent<any> = () => <div/>;
    const MyField = createField(InnerComponent);
    const name = 'name';
    const customProps = { a: 1, b: 2 };

    const element = shallow(<MyField name={name} inner={customProps}/>);
    const field = element.find(Field);

    expect(field.props()).toEqual({ render: InnerComponent, name, inner: customProps });
  });
});