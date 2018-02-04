import { selectDeep } from '../utils';
import { DEFAULT_FIELD_STATUS, FieldStatus } from '../utils/statusTracking/FieldStatus';
import { FieldStatusMapping } from '../utils/statusTracking/FieldStatusMapping';
import { FieldError, FieldErrorMapping, ValidationDefinition } from '../utils/validation';

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

  public readonly valid: boolean;
  public readonly inValid: boolean;

  public constructor(
    private readonly state: FormState<Model>,
    public readonly validationDefinition: ValidationDefinition<Model> = {},
    public readonly fieldErrorMapping: FieldErrorMapping = {}
  ) {
    this.valid = this.isValid();
    this.inValid = !this.valid;
  }

  public getFieldValue(path: string): any {
    return selectDeep({ object: this.model, path});
  }

  public getFieldError(path: string): FieldError {
    return this.fieldErrorMapping[path];
  }

  public getFieldStatus(fieldId: string): FieldStatus {
    return this.status[fieldId] || DEFAULT_FIELD_STATUS;
  }

  private isValid(): boolean {
    for (const fieldId in this.fieldErrorMapping) {
      if (!this.fieldErrorMapping.hasOwnProperty(fieldId)) {
        continue;
      }
      const error = this.fieldErrorMapping[fieldId];
      if (error !== undefined) {
        return false;
      }
    }
    return true;
  }
}
