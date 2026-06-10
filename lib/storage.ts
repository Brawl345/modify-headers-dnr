import { browser } from 'wxt/browser';
import { CURRENT_FORMAT } from './migrate';
import {
  ACTION_TYPE_MODIFY_HEADERS,
  ApplyOn,
  type FilterRule,
  HeaderOperation,
  type Options,
} from './types';

export const newRule = (): FilterRule => ({
  enabled: true,
  actionType: ACTION_TYPE_MODIFY_HEADERS,
  filter: '',
  field: '',
  value: '',
  operation: HeaderOperation.SET,
  priority: 1,
  applyOn: [ApplyOn.REQUEST],
  resourceTypes: ['main_frame'],
});

export const defaultOptions: Options = {
  format: CURRENT_FORMAT,
  enabled: true,
  rules: [
    {
      enabled: false,
      actionType: ACTION_TYPE_MODIFY_HEADERS,
      filter: 'https://example.com/',
      field: 'My-Example-Header',
      value: 'Hello World!',
      operation: HeaderOperation.SET,
      priority: 1,
      applyOn: [ApplyOn.REQUEST],
      resourceTypes: ['main_frame'],
    },
  ],
};

export const getOptions = async (): Promise<Options> =>
  (await browser.storage.sync.get(
    defaultOptions as unknown as Record<string, unknown>,
  )) as unknown as Options;

export const saveOptions = async (options: Options): Promise<void> => {
  await browser.storage.sync.set(options as unknown as Record<string, unknown>);
};
