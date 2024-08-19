import { ApplyOn, type FilterRule, type Options } from './types';

export const newRule: FilterRule = {
  enabled: true,
  filter: '',
  field: '',
  value: '',
  operation: chrome.declarativeNetRequest.HeaderOperation.SET,
  priority: 1,
  applyOn: ApplyOn.REQUEST,
  resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
};

export const defaultOptions: Options = {
  format: 2,
  enabled: true,
  rules: [
    {
      enabled: false,
      filter: 'https://example.com/',
      field: 'My-Example-Header',
      value: 'Hello World!',
      operation: chrome.declarativeNetRequest.HeaderOperation.SET,
      priority: 1,
      applyOn: ApplyOn.REQUEST,
      resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
    },
  ],
};

export const getOptions: () => Promise<Options> = async () =>
  chrome.storage.sync.get(defaultOptions) as Promise<Options>;
