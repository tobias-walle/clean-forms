import * as PropTypes from 'prop-types';
import * as React from 'react';
import { createPath } from '../../utils/createPath';
import { Path } from '../../utils/FieldRegister';

export const fieldGroupContextTypes = {
  namespace: PropTypes.string,
  path: PropTypes.string,
};

export interface FieldGroupContext {
  namespace?: Path;
  path?: Path;
}

export interface FieldGroupProps {
  name: string;
  accessor?: string;
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
    const { name, accessor } = this.props;
    return {
      path: createPath(this.context.path, accessor || name),
      namespace: createPath(this.context.namespace, name)
    };
  }
}
