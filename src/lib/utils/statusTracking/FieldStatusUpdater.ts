import { FieldRegister, Path } from '../FieldRegister';
import { cloneFieldStatus, DEFAULT_FIELD_STATUS, FieldStatusArguments } from './FieldStatus';
import { FieldStatusMapping } from './FieldStatusMapping';

export class FieldStatusUpdater {
  constructor(
    private fieldRegister: FieldRegister
  ) {
  }

  public markAsDirty(status: FieldStatusMapping, path: Path): FieldStatusMapping {
    return this.updateField(status, path, {dirty: true});
  }

  public markAsTouched(status: FieldStatusMapping, path: Path): FieldStatusMapping {
    return this.updateField(status, path, {touched: true});
  }

  private updateField(
    status: FieldStatusMapping,
    path: Path,
    update: Partial<FieldStatusArguments>
  ): FieldStatusMapping {
    if (!this.fieldRegister.includesPath(path)) {
      return status;
    }
    const oldStatus = status[path];
    if (!oldStatus) {
      throw new ReferenceError(`Couldn't find path "${path}" in status mapping ${JSON.stringify(status)}`);
    }
    return { ...status, [path]: cloneFieldStatus(oldStatus, update) };
  }

  public addIfFieldNotExists(status: FieldStatusMapping, path: Path): FieldStatusMapping {
    if (status[path] == null) {
      return {
        ...status,
        [path]: DEFAULT_FIELD_STATUS
      };
    } else {
      return status;
    }
  }

  public removeIfFieldExists(status: FieldStatusMapping, path: Path): FieldStatusMapping {
    const copy = { ...status };
    delete copy[path];
    return copy;
  }
}
