import { CURRENT_FORMAT, migrateOptions } from './migrate';
import { newRule } from './storage';
import {
  ACTION_TYPE_MODIFY_HEADERS,
  ApplyOn,
  type FilterRule,
  HeaderOperation,
  type Options,
} from './types';

// Identifies an export file as belonging to this extension. Import rejects any
// file whose `app` does not match, so unrelated JSON cannot be loaded.
export const EXPORT_APP_ID = 'modify-headers-dnr';

// Hard cap on the number of rules accepted from an untrusted file, so a crafted
// backup cannot lock up the UI by loading an unbounded amount of data.
export const MAX_IMPORT_RULES = 10000;

export interface ExportFile {
  app: string;
  format: number;
  exportedAt: string;
  rules: FilterRule[];
}

// Thrown for any malformed/incompatible import. `message` is an i18n key that
// the UI resolves via t().
export class ImportError extends Error {}

export function exportOptions(options: Options): string {
  const data: ExportFile = {
    app: EXPORT_APP_ID,
    format: options.format,
    exportedAt: new Date().toISOString(),
    rules: options.rules,
  };
  return JSON.stringify(data, null, 2);
}

const validOperations = new Set<string>(Object.values(HeaderOperation));
const validApplyOn = new Set<string>(Object.values(ApplyOn));

const asString = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const sanitizeApplyOn = (value: unknown): ApplyOn[] => {
  if (!Array.isArray(value)) return [ApplyOn.REQUEST];
  const cleaned = [
    ...new Set(
      value.filter(
        (item): item is ApplyOn =>
          typeof item === 'string' && validApplyOn.has(item),
      ),
    ),
  ];
  return cleaned.length > 0 ? cleaned : [ApplyOn.REQUEST];
};

const sanitizeResourceTypes = (
  value: unknown,
  fallback: string[],
): string[] => {
  if (!Array.isArray(value)) return fallback;
  const cleaned = [
    ...new Set(
      value.filter((item): item is string => typeof item === 'string'),
    ),
  ];
  return cleaned.length > 0 ? cleaned : fallback;
};

// Builds a clean FilterRule from untrusted data: every field is taken from the
// known defaults and only overwritten when the incoming value is well typed.
// Unknown keys are ignored, so nothing unexpected reaches storage or the DNR API.
const sanitizeRule = (raw: Record<string, unknown>): FilterRule => {
  const base = newRule();
  const operation = asString(raw.operation, base.operation);
  const priority = raw.priority;

  return {
    enabled: typeof raw.enabled === 'boolean' ? raw.enabled : base.enabled,
    actionType: ACTION_TYPE_MODIFY_HEADERS,
    filter: asString(raw.filter, base.filter),
    field: asString(raw.field, base.field),
    value: asString(raw.value, base.value),
    operation: validOperations.has(operation)
      ? (operation as FilterRule['operation'])
      : base.operation,
    priority:
      typeof priority === 'number' &&
      Number.isSafeInteger(priority) &&
      priority >= 1
        ? priority
        : base.priority,
    applyOn: sanitizeApplyOn(raw.applyOn),
    resourceTypes: sanitizeResourceTypes(raw.resourceTypes, base.resourceTypes),
  };
};

// Parses and sanitizes an export file's text into clean FilterRules. Older
// formats are migrated up; a newer format is rejected (forward compatibility).
// Throws ImportError (with an i18n key) on any problem.
export function parseImport(text: string): FilterRule[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ImportError('importErrorInvalidJson');
  }

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new ImportError('importErrorInvalidFile');
  }
  const obj = data as Record<string, unknown>;

  if (obj.app !== EXPORT_APP_ID) {
    throw new ImportError('importErrorWrongApp');
  }

  const format = obj.format;
  if (typeof format !== 'number' || !Number.isInteger(format) || format < 1) {
    throw new ImportError('importErrorInvalidFile');
  }
  if (format > CURRENT_FORMAT) {
    throw new ImportError('importErrorNewerVersion');
  }

  if (!Array.isArray(obj.rules)) {
    throw new ImportError('importErrorInvalidFile');
  }

  const rawRules = obj.rules.filter(
    (rule): rule is Record<string, unknown> =>
      rule !== null && typeof rule === 'object' && !Array.isArray(rule),
  );

  if (rawRules.length > MAX_IMPORT_RULES) {
    throw new ImportError('importErrorTooManyRules');
  }

  // Migrate the raw rules up to the current format before sanitizing, so that
  // fields a migration introduces (e.g. resourceTypes) are present.
  const work: Options = {
    format,
    enabled: true,
    rules: rawRules as unknown as FilterRule[],
  };
  migrateOptions(work);

  return (work.rules as unknown as Record<string, unknown>[]).map(sanitizeRule);
}
