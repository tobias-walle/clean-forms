import * as PropTypes from 'prop-types';
import * as React from 'react';
import { createPath } from '../../utils/createPath';

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
    return {
      groups: createPath(this.context.groups, this.props.name)
    };
  }
}
