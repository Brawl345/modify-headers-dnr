import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  srcDir: '.',
  manifestVersion: 3,
  manifest: ({ mode }) => {
    const isDev = mode !== 'production';
    return {
      name: '__MSG_extensionName__',
      description: '__MSG_extensionDescription__',
      default_locale: 'en',
      action: {
        default_title: '__MSG_extensionName__',
      },
      // declarativeNetRequestFeedback is only needed for onRuleMatchedDebug logging.
      permissions: [
        'declarativeNetRequest',
        'storage',
        ...(isDev ? ['declarativeNetRequestFeedback'] : []),
      ],
      host_permissions: ['<all_urls>'],
      browser_specific_settings: {
        gecko: {
          id: 'modify-headers-dnr@brawl345.github.com',
          strict_min_version: '128.0',
          // The extension only modifies headers locally; no data leaves the device.
          data_collection_permissions: {
            required: ['none'],
          },
        },
        gecko_android: {
          strict_min_version: '128.0',
        },
      },
    };
  },
});
