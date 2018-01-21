import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { StateWrapper } from './StateWrapper';

describe('StateWrapper', () => {
  it('should save the state of an component', () => {
    const element = mount(<StateWrapper
      initialState={{ clicked: false }}
      render={({ state, setState }) => <div>
          <label>{String(state.clicked)}</label>
          <button onClick={() => setState({ clicked: true })}/>
        </div>
      }
    />);
    const button = element.find('button');
    const label = element.find('label');

    expect(element.state()).toEqual({clicked: false});
    expect(label.text()).toBe('false');

    button.simulate('click');

    expect(element.state()).toEqual({clicked: true});
    expect(label.text()).toBe('true');
  });
});
