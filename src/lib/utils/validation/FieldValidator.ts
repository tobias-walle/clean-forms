import { Path } from '../FieldRegister';
import { selectDeep } from '../selectDeep';
import { FieldStatus } from '../statusTracking/FieldStatus';
import { ValidationDefinition, ValidationFunction } from './ValidationDefinition';

export interface ValidateFieldArguments<Model> {
  model: Model;
  validationDefinition: ValidationDefinition<Model>;
  path: Path;
}

export class FieldValidator<Model> {
  private path: Path;
  private value: any;
  private model: Model;
  private validationFunction: ValidationFunction;

  public static getValidationStatus<Model>(args: ValidateFieldArguments<Model>): Partial<FieldStatus> {
    const validator = new FieldValidator<Model>();
    return validator.getValidationStatus(args);
  }

  private getValidationStatus(args: ValidateFieldArguments<Model>): Partial<FieldStatus> {
    const error = this.validateField(args);
    const isValid = error === null;
    return {
      valid: isValid,
      inValid: !isValid,
      error: error || undefined
    };
  }

  private validateField({ model, validationDefinition, path }: ValidateFieldArguments<Model>): string | null {
    this.path = path;
    this.validationFunction = selectDeep({ object: validationDefinition, path, assert: false });
    this.value = selectDeep({ object: model, path, assert: false });
    this.model = model;
    if (!this.validationFunction) {
      return null;
    }
    return this.runValidationFunctionWithErrorChecking();
  }

  private runValidationFunctionWithErrorChecking(): string | null {
    try {
      return this.validationFunction({ value: this.value, formValue: this.model }) || null;
    } catch (e) {
      const value = JSON.stringify(this.value);
      const path = JSON.stringify(this.path);
      const errorMessage = `Error running validation function for value ${value} in path ${path}:`;
      console.error(errorMessage, e);
      return null;
    }
  }
}
