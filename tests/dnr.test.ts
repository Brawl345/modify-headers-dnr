import { isReactive, reactive } from 'vue';
import { describe, expect, it } from 'vitest';
import { constructNewRules } from '../lib/dnr';
import {
  ACTION_TYPE_MODIFY_HEADERS,
  ApplyOn,
  type FilterRule,
  HeaderOperation,
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

describe('constructNewRules', () => {
  it('skips disabled rules', () => {
    const result = constructNewRules([
      baseRule({ enabled: false }),
      baseRule({ field: 'X-Keep' }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.action.requestHeaders?.[0]?.header).toBe('X-Keep');
  });

  it('assigns sequential ids starting at 1', () => {
    const result = constructNewRules([baseRule(), baseRule(), baseRule()]);
    expect(result.map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it('builds request headers only when applied on request', () => {
    const [rule] = constructNewRules([
      baseRule({ applyOn: [ApplyOn.REQUEST] }),
    ]);
    expect(rule?.action.requestHeaders).toBeDefined();
    expect(rule?.action.responseHeaders).toBeUndefined();
  });

  it('builds response headers only when applied on response', () => {
    const [rule] = constructNewRules([
      baseRule({ applyOn: [ApplyOn.RESPONSE] }),
    ]);
    expect(rule?.action.responseHeaders).toBeDefined();
    expect(rule?.action.requestHeaders).toBeUndefined();
  });

  it('builds both when applied on request and response', () => {
    const [rule] = constructNewRules([
      baseRule({ applyOn: [ApplyOn.REQUEST, ApplyOn.RESPONSE] }),
    ]);
    expect(rule?.action.requestHeaders).toBeDefined();
    expect(rule?.action.responseHeaders).toBeDefined();
  });

  it('omits the value for the remove operation', () => {
    const [rule] = constructNewRules([
      baseRule({ operation: HeaderOperation.REMOVE, value: 'ignored' }),
    ]);
    expect(rule?.action.requestHeaders?.[0]?.value).toBeUndefined();
    expect(rule?.action.requestHeaders?.[0]?.operation).toBe('remove');
  });

  it('keeps the value for the set operation and carries priority', () => {
    const [rule] = constructNewRules([baseRule({ priority: 5 })]);
    expect(rule?.action.requestHeaders?.[0]?.value).toBe('hello');
    expect(rule?.priority).toBe(5);
    expect(rule?.condition.regexFilter).toBe('https://example.com/');
  });

  it('emits a plain resourceTypes array even for reactive input', () => {
    const reactiveRule = reactive(baseRule());
    const [rule] = constructNewRules([reactiveRule]);
    expect(isReactive(rule?.condition.resourceTypes)).toBe(false);
    expect(rule?.condition.resourceTypes).toEqual(['main_frame']);
  });
});
