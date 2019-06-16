import { asPath, Path } from '../models/Path';
import { FieldRegister } from '../utils/FieldRegister';
import { cloneFieldStatus, DEFAULT_FIELD_STATUS } from './FieldStatus';
import { FieldStatusMapping } from './FieldStatusMapping';
import { FieldStatusUpdater } from './FieldStatusUpdater';

describe('FieldStatusUpdater', () => {
  let fieldRegister: FieldRegister;
  let fieldStatusUpdater: FieldStatusUpdater;

  beforeEach(() => {
    fieldRegister = new FieldRegister();
    fieldStatusUpdater = new FieldStatusUpdater(fieldRegister);
  });

  describe('markAsDirty', () => {
    it('should work', () => {
      registerFields('a', 'b', 'c');
      const statusBefore: FieldStatusMapping = {
        a: DEFAULT_FIELD_STATUS,
        b: DEFAULT_FIELD_STATUS,
        c: DEFAULT_FIELD_STATUS,
      };
      const expectedStatus: FieldStatusMapping = {
        a: DEFAULT_FIELD_STATUS,
        b: cloneFieldStatus(DEFAULT_FIELD_STATUS, { dirty: true }),
        c: DEFAULT_FIELD_STATUS,
      };

      const result = fieldStatusUpdater.markAsDirty(statusBefore, asPath('b'));

      expect(result).toEqual(expectedStatus);
    });

    it('should not change field if it is not registered', () => {
      const statusBefore: FieldStatusMapping = {
        a: DEFAULT_FIELD_STATUS,
        b: DEFAULT_FIELD_STATUS,
        c: DEFAULT_FIELD_STATUS,
      };
      const expectedStatus: FieldStatusMapping = statusBefore;

      const result = fieldStatusUpdater.markAsDirty(statusBefore, asPath('b'));

      expect(result).toEqual(expectedStatus);
    });

    it('should not throw an error if the field does not exits but is registered', () => {
      fieldRegister.register(asPath('x'));
      expect(() => fieldStatusUpdater.markAsDirty({}, asPath('x'))).not.toThrowError();
    });
  });

  describe('markAsTouched', () => {
    it('should work', () => {
      registerFields('a', 'b', 'c');
      const statusBefore: FieldStatusMapping = {
        a: DEFAULT_FIELD_STATUS,
        b: DEFAULT_FIELD_STATUS,
        c: DEFAULT_FIELD_STATUS,
      };
      const expectedStatus: FieldStatusMapping = {
        a: DEFAULT_FIELD_STATUS,
        b: cloneFieldStatus(DEFAULT_FIELD_STATUS, { touched: true }),
        c: DEFAULT_FIELD_STATUS,
      };

      const result = fieldStatusUpdater.markAsTouched(statusBefore, asPath('b'));

      expect(result).toEqual(expectedStatus);
    });
  });

  describe('markAllAsTouched', () => {
    it('should work', () => {
      registerFields('a', 'b', 'c');
      const statusBefore: FieldStatusMapping = {
        a: DEFAULT_FIELD_STATUS,
        b: DEFAULT_FIELD_STATUS,
        c: DEFAULT_FIELD_STATUS,
      };
      const TOUCHED_STATUS = cloneFieldStatus(DEFAULT_FIELD_STATUS, {
        touched: true,
      });
      const expectedStatus: FieldStatusMapping = {
        a: TOUCHED_STATUS,
        b: TOUCHED_STATUS,
        c: TOUCHED_STATUS,
      };

      const result = fieldStatusUpdater.markAllAsTouched(statusBefore);

      expect(result).toEqual(expectedStatus);
    });
  });

  describe('addIfFieldNotExits', () => {
    it('should add field it it not exists', () => {
      const statusBefore: FieldStatusMapping = {
        a: DEFAULT_FIELD_STATUS,
        b: DEFAULT_FIELD_STATUS,
      };
      const expectedStatus: FieldStatusMapping = {
        a: DEFAULT_FIELD_STATUS,
        b: DEFAULT_FIELD_STATUS,
        c: DEFAULT_FIELD_STATUS,
      };

      const result = fieldStatusUpdater.addIfFieldNotExists(statusBefore, asPath('c'));

      expect(result).toEqual(expectedStatus);
    });

    it('should not override field it not exists', () => {
      const statusBefore: FieldStatusMapping = {
        a: cloneFieldStatus(DEFAULT_FIELD_STATUS, {
          dirty: true,
          touched: true,
        }),
      };
      const expectedStatus: FieldStatusMapping = statusBefore;

      const result = fieldStatusUpdater.addIfFieldNotExists(statusBefore, asPath('a'));

      expect(result).toEqual(expectedStatus);
    });
  });

  describe('removeIfFieldExits', () => {
    it('should remove field it it exists', () => {
      const statusBefore: FieldStatusMapping = {
        a: DEFAULT_FIELD_STATUS,
        b: DEFAULT_FIELD_STATUS,
        c: DEFAULT_FIELD_STATUS,
      };
      const expectedStatus: FieldStatusMapping = {
        a: DEFAULT_FIELD_STATUS,
        b: DEFAULT_FIELD_STATUS,
      };

      const result = fieldStatusUpdater.removeIfFieldExists(
        statusBefore,
        asPath('c')
      );

      expect(result).toEqual(expectedStatus);
    });

    it('should do nothing if field not exists', () => {
      const statusBefore: FieldStatusMapping = {
        a: DEFAULT_FIELD_STATUS,
      };
      const expectedStatus: FieldStatusMapping = statusBefore;

      const result = fieldStatusUpdater.removeIfFieldExists(
        statusBefore,
        asPath('b')
      );

      expect(result).toEqual(expectedStatus);
    });
  });

  function registerFields(...fields: string[]): void {
    fields.forEach(field => {
      fieldRegister.register(asPath(field));
    });
  }
});
