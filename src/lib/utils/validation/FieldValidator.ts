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
    } else {
      return this.runValidationFunctionInTryCatchAndCheckType(validation);
    }
  }

  private runArrayValidation(validation: ArrayValidation): string | null {
    if (this.value instanceof Array) {
      return this.runValidationFunctionInTryCatch(validation.arrayValidation);
    } else {
      return this.runValidationFunctionInTryCatchAndCheckType(validation.itemValidation);
    }
  }

  private runValidationFunctionInTryCatchAndCheckType(validationFunction: any): string | null {
    if (typeof validationFunction === 'function') {
      return this.runValidationFunctionInTryCatch(validationFunction);
    } else {
      const pathAsString = JSON.stringify(this.path);
      const errorMessage = `Invalid validation type "${typeof validationFunction}" for path "${pathAsString}"`;
      console.error(errorMessage);
      return errorMessage;
    }
  }

  private runValidationFunctionInTryCatch(validationFunction: ValidationFunction | undefined | null): string | null {
    try {
      return this.runValidationFunctionIfDefined(validationFunction);
    } catch (e) {
      const value = JSON.stringify(this.value);
      const path = JSON.stringify(this.path);
      const errorMessage = `Error while running validation function for value ${value} in path ${path}:`;
      console.error(errorMessage, e);
      return errorMessage;
    }
  }

  private runValidationFunctionIfDefined(validationFunction: ValidationFunction | undefined | null): string | null {
    if (validationFunction == null) {
      return null;
    }
    return validationFunction({ value: this.value, formValue: this.model }) || null;
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
