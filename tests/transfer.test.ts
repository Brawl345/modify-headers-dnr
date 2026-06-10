import { describe, expect, it } from 'vitest';
import { CURRENT_FORMAT } from '../lib/migrate';
import {
  EXPORT_APP_ID,
  exportOptions,
  ImportError,
  MAX_IMPORT_RULES,
  parseImport,
} from '../lib/transfer';
import {
  ACTION_TYPE_MODIFY_HEADERS,
  ApplyOn,
  type FilterRule,
  HeaderOperation,
  type Options,
} from '../lib/types';

const baseRule = (overrides: Partial<FilterRule> = {}): FilterRule => ({
  enabled: true,
  actionType: ACTION_TYPE_MODIFY_HEADERS,
  filter: 'https://example.com/',
  operation: HeaderOperation.SET,
  field: 'X-Test',
  value: 'hello',
  priority: 1,
  applyOn: [ApplyOn.REQUEST],
  resourceTypes: ['main_frame'],
  ...overrides,
});

const options = (rules: FilterRule[]): Options => ({
  format: CURRENT_FORMAT,
  enabled: true,
  rules,
});

describe('exportOptions', () => {
  it('wraps rules in a versioned envelope', () => {
    const json = JSON.parse(exportOptions(options([baseRule()])));
    expect(json.app).toBe(EXPORT_APP_ID);
    expect(json.format).toBe(CURRENT_FORMAT);
    expect(typeof json.exportedAt).toBe('string');
    expect(json.rules).toHaveLength(1);
  });

  it('round-trips through parseImport', () => {
    const rules = [baseRule(), baseRule({ field: 'X-Two', priority: 5 })];
    const result = parseImport(exportOptions(options(rules)));
    expect(result).toEqual(rules);
  });
});

describe('parseImport rejections', () => {
  it('rejects invalid JSON', () => {
    expect(() => parseImport('{not json')).toThrow(ImportError);
  });

  it('rejects a file from another app', () => {
    const text = JSON.stringify({
      app: 'something-else',
      format: 3,
      rules: [],
    });
    expect(() => parseImport(text)).toThrowError('importErrorWrongApp');
  });

  it('rejects a newer format', () => {
    const text = JSON.stringify({
      app: EXPORT_APP_ID,
      format: CURRENT_FORMAT + 1,
      rules: [],
    });
    expect(() => parseImport(text)).toThrowError('importErrorNewerVersion');
  });

  it('rejects a missing rules array', () => {
    const text = JSON.stringify({ app: EXPORT_APP_ID, format: 3 });
    expect(() => parseImport(text)).toThrowError('importErrorInvalidFile');
  });

  it('rejects too many rules', () => {
    const text = JSON.stringify({
      app: EXPORT_APP_ID,
      format: 3,
      rules: new Array(MAX_IMPORT_RULES + 1).fill(baseRule()),
    });
    expect(() => parseImport(text)).toThrowError('importErrorTooManyRules');
  });
});

describe('parseImport sanitization', () => {
  it('strips unknown keys and bad types, falling back to defaults', () => {
    const text = JSON.stringify({
      app: EXPORT_APP_ID,
      format: 3,
      rules: [
        {
          filter: 'https://x/',
          field: 'X-Y',
          value: 'v',
          operation: 'bogus',
          priority: -3,
          enabled: 'yes',
          applyOn: ['request', 'nope'],
          resourceTypes: [],
          evil: '<script>',
        },
      ],
    });
    const [rule] = parseImport(text);
    expect(rule).toMatchObject({
      filter: 'https://x/',
      field: 'X-Y',
      value: 'v',
      operation: HeaderOperation.SET,
      priority: 1,
      enabled: true,
      applyOn: [ApplyOn.REQUEST],
      resourceTypes: ['main_frame'],
    });
    expect('evil' in (rule as object)).toBe(false);
    expect(rule?.actionType).toBe(ACTION_TYPE_MODIFY_HEADERS);
  });

  it('ignores non-object rule entries', () => {
    const text = JSON.stringify({
      app: EXPORT_APP_ID,
      format: 3,
      rules: [baseRule(), 'garbage', null, 42],
    });
    expect(parseImport(text)).toHaveLength(1);
  });

  it('does not pollute Object.prototype', () => {
    const text = `{"app":"${EXPORT_APP_ID}","format":3,"rules":[{"__proto__":{"polluted":true}}]}`;
    parseImport(text);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe('parseImport migration', () => {
  it('migrates a format 1 export (adds resourceTypes)', () => {
    const text = JSON.stringify({
      app: EXPORT_APP_ID,
      format: 1,
      rules: [
        { filter: 'https://a/', field: 'F', value: 'v', applyOn: 'request' },
      ],
    });
    const [rule] = parseImport(text);
    expect(rule?.resourceTypes).toEqual(['main_frame']);
    expect(rule?.applyOn).toEqual([ApplyOn.REQUEST]);
  });

  it('migrates a format 2 export (applyOn string to array)', () => {
    const text = JSON.stringify({
      app: EXPORT_APP_ID,
      format: 2,
      rules: [
        {
          filter: 'https://a/',
          field: 'F',
          value: 'v',
          applyOn: 'response',
          resourceTypes: ['main_frame'],
        },
      ],
    });
    const [rule] = parseImport(text);
    expect(rule?.applyOn).toEqual([ApplyOn.RESPONSE]);
    expect(rule?.actionType).toBe(ACTION_TYPE_MODIFY_HEADERS);
  });
});
