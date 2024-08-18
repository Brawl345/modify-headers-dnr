import { ApplyOn, type FilterRule } from './types';

export const isNullish = <T>(
  argument: T | undefined | null,
): argument is undefined | null => argument === null || argument === undefined;

export const isBlank = (str: string) => !str.trim();

export const getMessage = (
  key: string,
  parameters?: string | string[] | undefined,
) => chrome.i18n.getMessage(key, parameters) || `??${key}??`;

export const MAX_NUMBER_OF_RULES = chrome.declarativeNetRequest
  .MAX_NUMBER_OF_UNSAFE_DYNAMIC_RULES // Firefox doesn't have this
  ? chrome.declarativeNetRequest.MAX_NUMBER_OF_UNSAFE_DYNAMIC_RULES
  : chrome.declarativeNetRequest.MAX_NUMBER_OF_DYNAMIC_RULES;

export const isValidRegex = (pattern: RegExp | string) => {
  try {
    new RegExp(pattern);
    return true;
  } catch (e) {
    return false;
  }
};

export const constructNewRules = (
  rules: FilterRule[],
): chrome.declarativeNetRequest.Rule[] => {
  return rules
    .filter((rule) => rule.enabled)
    .map((rule, index) => {
      const headerInfo: chrome.declarativeNetRequest.ModifyHeaderInfo[] = [
        {
          header: rule.field,
          operation: rule.operation,
          value:
            rule.operation ===
            chrome.declarativeNetRequest.HeaderOperation.REMOVE
              ? undefined
              : rule.value,
        },
      ];

      return {
        id: index + 1,
        condition: {
          regexFilter: rule.filter,
          // TODO: Make this customizable
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders:
            rule.applyOn === ApplyOn.REQUEST ? headerInfo : undefined,
          responseHeaders:
            rule.applyOn === ApplyOn.RESPONSE ? headerInfo : undefined,
        },
      };
    });
};

export const isFirefox =
  // @ts-ignore
  typeof window !== 'undefined' && window.browser && browser.runtime;
