import { FieldRegister, Path } from '../utils/FieldRegister';
import { isShallowEqual } from '../utils/isShallowEqual';
import { cloneFieldStatus, DEFAULT_FIELD_STATUS, FieldStatusArguments } from './FieldStatus';
import { FieldStatusMapping } from './FieldStatusMapping';

export class FieldStatusUpdater {
  constructor(
    private fieldRegister: FieldRegister,
  ) {
  }

  public markAsDirty(status: FieldStatusMapping, path: Path): FieldStatusMapping {
    return this.updateField(status, path, { dirty: true });
  }

  public markAsTouched(status: FieldStatusMapping, path: Path): FieldStatusMapping {
    return this.updateField(status, path, { touched: true });
  }

  public markAllAsTouched(status: FieldStatusMapping): FieldStatusMapping {
    return Object.keys(status)
      .reduce((result, path) => {
        return this.markAsTouched(result, path);
      }, status);
  }

  private updateField(
    status: FieldStatusMapping,
    path: Path,
    update: Partial<FieldStatusArguments>,
  ): FieldStatusMapping {
    if (!this.fieldRegister.includesPath(path)) {
      return status;
    }
    const oldStatus = status[path] || DEFAULT_FIELD_STATUS;
    const newStatus = cloneFieldStatus(oldStatus, update);
    if (!isShallowEqual(oldStatus, newStatus)) {
      return { ...status, [path]: newStatus };
    }
    return status;
  }

  public addIfFieldNotExists(status: FieldStatusMapping, path: Path): FieldStatusMapping {
    if (status[path] == null) {
      return {
        ...status,
        [path]: DEFAULT_FIELD_STATUS,
      };
    } else {
      return status;
    }
  }

  public removeIfFieldExists(status: FieldStatusMapping, path: Path): FieldStatusMapping {
    if (status[path] == null) {
      return status;
    }
    const copy = { ...status };
    delete copy[path];
    return copy;
  }
}
