import { browser } from 'wxt/browser';
import { applyRules } from '../lib/dnr';
import { migrateOptions } from '../lib/migrate';
import { getOptions, saveOptions } from '../lib/storage';

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
      if (migrateOptions(options)) {
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
