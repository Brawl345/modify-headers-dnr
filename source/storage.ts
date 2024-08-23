import { ApplyOn, type FilterRule, type Options } from './types';

export const newRule: FilterRule = {
  enabled: true,
  actionType: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
  filter: '',
  field: '',
  value: '',
  operation: chrome.declarativeNetRequest.HeaderOperation.SET,
  priority: 1,
  applyOn: [ApplyOn.REQUEST],
  resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
};

export const defaultOptions: Options = {
  format: 3,
  enabled: true,
  rules: [
    {
      enabled: false,
      actionType: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      filter: 'https://example.com/',
      field: 'My-Example-Header',
      value: 'Hello World!',
      operation: chrome.declarativeNetRequest.HeaderOperation.SET,
      priority: 1,
      applyOn: [ApplyOn.REQUEST],
      resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
    },
  ],
};

export const getOptions: () => Promise<Options> = async () =>
  chrome.storage.sync.get(defaultOptions) as Promise<Options>;
