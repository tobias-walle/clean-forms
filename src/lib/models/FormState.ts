import { FieldStatusMapping } from '../statusTracking';

export interface FormState<Model> {
  model: Model;
  status?: FieldStatusMapping;
}
