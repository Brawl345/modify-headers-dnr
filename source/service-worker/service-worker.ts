import '../polyfills';
import { getOptions } from '../storage';
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
});

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());

chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((matchedRule) => {
  console.log('RULE MATCHED', matchedRule);
});
