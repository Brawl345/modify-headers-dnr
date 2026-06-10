import { describe, expect, it, vi } from 'vitest';

// Decouple validation messages from browser.i18n in tests.
vi.mock('../lib/i18n', () => ({ t: (key: string) => key }));

import {
  ACTION_TYPE_MODIFY_HEADERS,
  ApplyOn,
  type FilterRule,
  HeaderOperation,
} from '../lib/types';
import { validateRule, validateRules } from '../lib/validation';

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

describe('validateRule', () => {
  it('returns no errors for a valid rule', () => {
    expect(validateRule(baseRule())).toEqual({});
  });

  it('flags a blank filter', () => {
    expect(validateRule(baseRule({ filter: '  ' })).filter).toBe(
      'errFilterRequired',
    );
  });

  it('flags an invalid regex filter', () => {
    expect(validateRule(baseRule({ filter: '[' })).filter).toBe(
      'errFilterInvalid',
    );
  });

  it('flags a blank field', () => {
    expect(validateRule(baseRule({ field: '' })).field).toBe(
      'errFieldRequired',
    );
  });

  it('requires a value for set but not for remove', () => {
    expect(validateRule(baseRule({ value: '' })).value).toBe(
      'errValueRequired',
    );
    expect(
      validateRule(baseRule({ operation: HeaderOperation.REMOVE, value: '' }))
        .value,
    ).toBeUndefined();
  });

  it('flags a priority below 1', () => {
    expect(validateRule(baseRule({ priority: 0 })).priority).toBe(
      'errPriorityTooLow',
    );
  });

  it('flags empty applyOn and resourceTypes', () => {
    expect(validateRule(baseRule({ applyOn: [] })).applyOn).toBe(
      'errApplyOnRequired',
    );
    expect(validateRule(baseRule({ resourceTypes: [] })).resourceTypes).toBe(
      'errResourceTypesRequired',
    );
  });
});

describe('validateRules', () => {
  it('keys errors by rule index and skips valid rules', () => {
    const errors = validateRules([
      baseRule(),
      baseRule({ field: '' }),
      baseRule(),
    ]);
    expect(Object.keys(errors)).toEqual(['1']);
    expect(errors[1]?.field).toBe('errFieldRequired');
  });
});
