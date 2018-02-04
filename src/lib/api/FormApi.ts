import { selectDeep } from '../utils';
import { DEFAULT_FIELD_STATUS, FieldStatus } from '../utils/statusTracking/FieldStatus';
import { FieldStatusMapping } from '../utils/statusTracking/FieldStatusMapping';
import { ValidationDefinition, FieldError, FieldErrorMapping } from '../utils/validation';

export interface FormState<Model> {
  model: Model;
  status?: FieldStatusMapping;
}

export class FormApi<Model> {
  public get status(): FieldStatusMapping {
    return this.state.status || {};
  }

  public get model(): Model {
    return this.state.model;
  }

  public constructor(
    private readonly state: FormState<Model>,
    public readonly validationDefinition: ValidationDefinition<Model> = {},
    public readonly fieldErrorMapping: FieldErrorMapping = {}
  ) {
  }

  public getFieldValue(path: string): any {
    return selectDeep({ object: this.model, path});
  }

  public getFieldStatus(fieldId: string): FieldStatus {
    return this.status[fieldId] || DEFAULT_FIELD_STATUS;
  }
}
