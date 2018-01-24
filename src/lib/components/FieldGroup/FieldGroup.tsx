import * as PropTypes from 'prop-types';
import * as React from 'react';

export const fieldGroupContextTypes = {
  groups: PropTypes.arrayOf(PropTypes.string),
};

export interface FieldGroupContext {
  groups?: string[];
}

export interface FieldGroupProps {
  name: string;
}

export interface FieldGroupState {
}

export class FieldGroup extends React.Component<FieldGroupProps, FieldGroupState> {
  public static childContextTypes = fieldGroupContextTypes;
  public static contextTypes = fieldGroupContextTypes;
  public context: FieldGroupContext;

  public render() {
    return this.props.children;
  }

  public getChildContext(): FieldGroupContext {
    const groups = this.context.groups || [];
    return {
      groups: [...groups, this.props.name]
    };
  }
}
