import { asPath, getPathAsString, Path } from '../models/Path';
import { FieldRegister } from '../utils/FieldRegister';
import { isShallowEqual } from '../utils/isShallowEqual';
import { cloneFieldStatus, DEFAULT_FIELD_STATUS, FieldStatusArguments } from './FieldStatus';
import { FieldStatusMapping } from './FieldStatusMapping';

export class FieldStatusUpdater {
  constructor(
    private fieldRegister: FieldRegister,
  ) {
  }

  public markAsDirty(status: FieldStatusMapping, path: Path<unknown>): FieldStatusMapping {
    return this.updateField(status, path, { dirty: true });
  }

  public markAsTouched(status: FieldStatusMapping, path: Path<unknown>): FieldStatusMapping {
    return this.updateField(status, path, { touched: true });
  }

  public markAllAsTouched(status: FieldStatusMapping): FieldStatusMapping {
    return Object.keys(status)
      .reduce((result, path) => {
        return this.markAsTouched(result, asPath(path));
      }, status);
  }

  private updateField(
    status: FieldStatusMapping,
    path: Path<unknown>,
    update: Partial<FieldStatusArguments>,
  ): FieldStatusMapping {
    if (!this.fieldRegister.includesPath(path)) {
      return status;
    }
    const pathAsString = getPathAsString(path);
    const oldStatus = status[pathAsString] || DEFAULT_FIELD_STATUS;
    const newStatus = cloneFieldStatus(oldStatus, update);
    if (!isShallowEqual(oldStatus, newStatus)) {
      return { ...status, [pathAsString]: newStatus };
    }
    return status;
  }

  public addIfFieldNotExists(status: FieldStatusMapping, path: Path<unknown>): FieldStatusMapping {
    const pathAsString = getPathAsString(path);
    if (status[pathAsString] == null) {
      return {
        ...status,
        [pathAsString]: DEFAULT_FIELD_STATUS,
      };
    } else {
      return status;
    }
  }

  public removeIfFieldExists(status: FieldStatusMapping, path: Path<unknown>): FieldStatusMapping {
    const pathAsString = getPathAsString(path);
    if (status[pathAsString] == null) {
      return status;
    }
    const copy = { ...status };
    delete copy[pathAsString];
    return copy;
  }
}
