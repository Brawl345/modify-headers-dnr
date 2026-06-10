import { type Browser, browser } from 'wxt/browser';
import {
  ApplyOn,
  type FilterRule,
  HeaderOperation,
  type Options,
} from './types';

type DnrRule = Browser.declarativeNetRequest.Rule;
type ModifyHeaderInfo = Browser.declarativeNetRequest.ModifyHeaderInfo;
type ResourceTypes = Browser.declarativeNetRequest.RuleCondition['resourceTypes'];

interface NativeDnr {
  ResourceType?: Record<string, string>;
  MAX_NUMBER_OF_UNSAFE_DYNAMIC_RULES?: number;
  MAX_NUMBER_OF_DYNAMIC_RULES?: number;
}
const nativeDnr: NativeDnr =
  (globalThis as { chrome?: { declarativeNetRequest?: NativeDnr } }).chrome
    ?.declarativeNetRequest ?? {};

const resourceTypeEnum = nativeDnr.ResourceType ?? {};

// [messageKey, value] pairs, always listing MAIN_FRAME first.
export const RESOURCE_TYPES: [string, string][] = resourceTypeEnum.MAIN_FRAME
  ? [
      ['MAIN_FRAME', resourceTypeEnum.MAIN_FRAME],
      ...Object.entries(resourceTypeEnum).filter(
        ([, value]) => value !== resourceTypeEnum.MAIN_FRAME,
      ),
    ]
  : [];

export const validResourceTypes = new Set(Object.values(resourceTypeEnum));

export const validAppliesOn = new Set<string>(Object.values(ApplyOn));

// Firefox lacks MAX_NUMBER_OF_UNSAFE_DYNAMIC_RULES.
export const MAX_NUMBER_OF_RULES: number =
  nativeDnr.MAX_NUMBER_OF_UNSAFE_DYNAMIC_RULES ??
  nativeDnr.MAX_NUMBER_OF_DYNAMIC_RULES ??
  5000;

export const constructNewRules = (rules: FilterRule[]): DnrRule[] =>
  rules
    .filter((rule) => rule.enabled)
    .map((rule, index) => {
      const headerInfo: ModifyHeaderInfo[] = [
        {
          header: rule.field,
          operation: rule.operation,
          value:
            rule.operation === HeaderOperation.REMOVE ? undefined : rule.value,
        },
      ];

      return {
        id: index + 1,
        condition: {
          regexFilter: rule.filter,
          resourceTypes: [...rule.resourceTypes] as ResourceTypes,
        },
        priority: rule.priority,
        action: {
          type: rule.actionType,
          requestHeaders: rule.applyOn.includes(ApplyOn.REQUEST)
            ? headerInfo
            : undefined,
          responseHeaders: rule.applyOn.includes(ApplyOn.RESPONSE)
            ? headerInfo
            : undefined,
        },
      } satisfies DnrRule;
    });

export const applyRules = async (options: Options): Promise<void> => {
  const oldRuleIds = (
    await browser.declarativeNetRequest.getDynamicRules()
  ).map((rule) => rule.id);

  const newRules = options.enabled ? constructNewRules(options.rules) : [];

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldRuleIds,
    addRules: newRules,
  });
};
