import * as React from 'react';
import { Path } from '../utils';

export interface FieldGroupContextValue {
  namespace?: Path;
  path?: Path;
}

export const FieldGroupContext = React.createContext<FieldGroupContextValue>({});
