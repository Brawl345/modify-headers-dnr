import { browser } from 'wxt/browser';
import { applyRules } from '../lib/dnr';
import { getOptions, saveOptions } from '../lib/storage';
import { ACTION_TYPE_MODIFY_HEADERS, type ApplyOn } from '../lib/types';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      // The user may already have rules synced from another device.
      const options = await getOptions();
      if (options.rules.length > 0) {
        await applyRules(options);
      }
      await browser.runtime.openOptionsPage();
      return;
    }

    if (details.reason === 'update') {
      const options = await getOptions();
      let migrationRan = false;

      // v2: Added ResourceTypes
      if (options.format === 1) {
        options.format = 2;
        for (const rule of options.rules) {
          rule.resourceTypes = ['main_frame'];
        }
        migrationRan = true;
      }

      // v3: ApplyOn as array + ActionType
      if (options.format === 2) {
        options.format = 3;
        for (const rule of options.rules) {
          rule.actionType = ACTION_TYPE_MODIFY_HEADERS;
          rule.applyOn = [rule.applyOn as unknown as ApplyOn];
        }
        migrationRan = true;
      }

      if (migrationRan) {
        await saveOptions(options);
      }
    }
  });

  if (import.meta.env.DEV) {
    browser.declarativeNetRequest.onRuleMatchedDebug?.addListener(
      (matchedRule) => {
        console.log('RULE MATCHED', matchedRule);
      },
    );
  }
});
