// @ts-nocheck

// Firefox lacks these types

if (!chrome.declarativeNetRequest.RuleActionType) {
  chrome.declarativeNetRequest.RuleActionType = {
    BLOCK: 'block',
    REDIRECT: 'redirect',
    ALLOW: 'allow',
    UPGRADE_SCHEME: 'upgradeScheme',
    MODIFY_HEADERS: 'modifyHeaders',
    ALLOW_ALL_REQUESTS: 'allowAllRequests',
  };
}

if (!chrome.declarativeNetRequest.HeaderOperation) {
  chrome.declarativeNetRequest.HeaderOperation = {
    APPEND: 'append',
    SET: 'set',
    REMOVE: 'remove',
  };
}
