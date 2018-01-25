import { Path } from '../FieldRegister';
import { selectDeep, SelectDeepArgs } from '../selectDeep';
import { FieldStatus } from '../statusTracking/FieldStatus';
import { ArrayValidation, ValidationDefinition, ValidationFunction, ValidationResolver } from './ValidationDefinition';

export interface ValidateFieldArguments<Model> {
  model: Model;
  validationDefinition: ValidationDefinition<Model>;
  path: Path;
}

export class FieldValidator<Model> {
  private path: Path;
  private value: any;
  private model: Model;

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
    this.value = selectDeep({ object: model, path, assert: false });
    this.model = model;
    const validation: ValidationResolver = selectDeepValidator({ object: validationDefinition, path, assert: false });
    if (!validation) {
      return null;
    } else if (validation instanceof ArrayValidation) {
      return this.runArrayValidation(validation);
    } else if (validation instanceof Function) {
      return this.runValidationFunctionInTryCatch(validation);
    } else {
      const pathAsString = JSON.stringify(path);
      console.warn(`Invalid validation "${typeof validation}" for path "${pathAsString}"`);
      return null;
    }
  }

  private runArrayValidation(validation: ArrayValidation): string | null {
    if (this.value instanceof Array && validation.arrayValidation) {
      return this.runValidationFunctionInTryCatch(validation.arrayValidation);
    } else if (typeof validation.itemValidation === 'function') {
      return this.runValidationFunctionInTryCatch(validation.itemValidation);
    } else if (!(this.value instanceof Array)) {
      const pathAsString = JSON.stringify(this.path);
      console.warn(`Invalid array validation type "${typeof validation.itemValidation}" for path "${pathAsString}"`);
    }
    return null;
  }

  private runValidationFunctionInTryCatch(validationFunction: ValidationFunction): string | null {
    try {
      return validationFunction({ value: this.value, formValue: this.model }) || null;
    } catch (e) {
      const value = JSON.stringify(this.value);
      const path = JSON.stringify(this.path);
      const errorMessage = `Error running validation function for value ${value} in path ${path}:`;
      console.error(errorMessage, e);
      return null;
    }
  }
}

function selectDeepValidator({ object, path }: SelectDeepArgs): any {
  return path.reduce((item, key: string) => {
    if (item === undefined) {
      return;
    }
    if (item instanceof ArrayValidation) {
      return item.itemValidation;
    }
    return item[key];
  }, object);
}
