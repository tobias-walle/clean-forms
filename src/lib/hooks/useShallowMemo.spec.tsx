import * as React from 'react';
import { memo, useState } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';

import { useShallowMemo } from './useShallowMemo';

afterEach(cleanup);

describe('useShallowMemo', () => {
  const renderChildComponent = jest.fn();
  const ChildComponent = memo((props: any) => {
    renderChildComponent();
    return <div>{JSON.stringify(props)}</div>;
  });

  beforeEach(() => renderChildComponent.mockReset());

  it('should render multiple times, even if the object does not change, if the hook is not used', () => {
    function TestComponent() {
      const [state, setState] = useState({});
      return (
        <div>
          <button onClick={() => setState({ other: 'value' })}>Change</button>
          <button onClick={() => setState({})}>Not Change</button>
          <ChildComponent value={state}/>
        </div>
      );
    }

    const { getByText } = render(<TestComponent/>);

    expect(renderChildComponent).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText('Not Change'));

    expect(renderChildComponent).toHaveBeenCalledTimes(2);

    fireEvent.click(getByText('Change'));

    expect(renderChildComponent).toHaveBeenCalledTimes(3);
  });

  it('should not render if the object does not change, if the hook is used', () => {
    function TestComponent() {
      const [_state, setState] = useState({});
      const state = useShallowMemo(_state);
      return (
        <div>
          <button onClick={() => setState({ other: 'value' })}>Change</button>
          <button onClick={() => setState({})}>Not Change</button>
          <ChildComponent value={state}/>
        </div>
      );
    }

    const { getByText } = render(<TestComponent/>);

    expect(renderChildComponent).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText('Not Change'));

    expect(renderChildComponent).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText('Change'));

    expect(renderChildComponent).toHaveBeenCalledTimes(2);
  });

  it('should work with arrays', () => {
    function TestComponent() {
      const [_state, setState] = useState<number[]>([]);
      const state = useShallowMemo(_state);
      return (
        <div>
          <button onClick={() => setState([1])}>Change</button>
          <button onClick={() => setState([])}>Not Change</button>
          <ChildComponent value={state}/>
        </div>
      );
    }

    const { getByText } = render(<TestComponent/>);

    expect(renderChildComponent).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText('Not Change'));

    expect(renderChildComponent).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText('Change'));

    expect(renderChildComponent).toHaveBeenCalledTimes(2);
  });
});
