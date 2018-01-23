import addons from '@storybook/addons';
import * as React from 'react';
import JsonView from 'react-json-view';
import { SET_STATE } from './StateWrapper';

export interface StateAddonProps {
  channel: any;
}

export interface StateAddonState {
  storyState: any;
}

export class StateAddon extends React.Component<StateAddonProps, StateAddonState> {
  public state: StateAddonState = {
    storyState: {}
  };

  public render() {
    return <JsonView src={this.state.storyState} name={false}/>;
  }

  public componentDidMount() {
    const { channel } = this.props;
    channel.on(SET_STATE, this.setDisplayedState);
  }

  public componentWillUnmount() {
    const { channel } = this.props;
    channel.removelistener(SET_STATE, this.setDisplayedState);
  }

  private setDisplayedState = (state: any) => {
    this.setState({storyState: state});
  }
}

addons.register('my/state', (api: any) => {
  addons.addPanel('my/state', {
    title: 'State',
    render: () => <StateAddon channel={addons.getChannel()}/>
  });
});
