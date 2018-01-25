import { FieldStatus } from './FieldStatus';

export type FieldStatusMapping<Model> = {
  [key in keyof Model]?: FieldStatus | FieldStatusMapping<Model>;
};
