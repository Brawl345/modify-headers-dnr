import {
  ACTION_TYPE_MODIFY_HEADERS,
  type ApplyOn,
  type Options,
} from './types';

// The current storage/export format. Bump this and add a migration step below
// whenever the shape of FilterRule/Options changes.
export const CURRENT_FORMAT = 3;

// Migrates an Options object in place from any older format up to CURRENT_FORMAT.
// Returns true if at least one migration step ran. Shared by the update handler
// and the importer so older backups load into the current model.
export function migrateOptions(options: Options): boolean {
  let ran = false;

  // v2: Added ResourceTypes
  if (options.format === 1) {
    options.format = 2;
    for (const rule of options.rules) {
      rule.resourceTypes = ['main_frame'];
    }
    ran = true;
  }

  // v3: ApplyOn as array + ActionType
  if (options.format === 2) {
    options.format = 3;
    for (const rule of options.rules) {
      rule.actionType = ACTION_TYPE_MODIFY_HEADERS;
      rule.applyOn = [rule.applyOn as unknown as ApplyOn];
    }
    ran = true;
  }

  return ran;
}
