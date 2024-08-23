import '../polyfills';
import { getOptions } from '../storage';
import type { ApplyOn } from '../types';
import { constructNewRules } from '../utils';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const { rules } = await getOptions();

    // User already had some rules synced
    if (rules.length > 0) {
      const oldRuleIds = (
        await chrome.declarativeNetRequest.getDynamicRules()
      ).map((rule) => rule.id);
      const newRules = constructNewRules(rules);
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRuleIds,
        addRules: newRules,
      });
    }

    await chrome.runtime.openOptionsPage();
  }

  if (details.reason === 'update') {
    const options = await getOptions();

    let migrationRan = false;

    // v2: Added ResourceTypes
    if (options.format === 1) {
      console.info('MIGRATION: 1 => 2');
      options.format = 2;
      for (const rule of options.rules) {
        rule.resourceTypes = [
          chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
        ];
      }
      migrationRan = true;
    }

    // v3:
    //  - ApplyOn as array
    //  - Added ActionType
    if (options.format === 2) {
      console.info('MIGRATION: 2 => 3');
      options.format = 3;
      for (const rule of options.rules) {
        rule.actionType =
          chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS;
        rule.applyOn = [rule.applyOn as unknown as ApplyOn];
      }
      migrationRan = true;
    }

    if (migrationRan) {
      console.info('MIGRATION: DONE');
      await chrome.storage.sync.set(options);
    }
  }
});

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());

chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((matchedRule) => {
  console.log('RULE MATCHED', matchedRule);
});
