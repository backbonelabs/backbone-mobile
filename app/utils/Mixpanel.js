import { NativeModules } from 'react-native';

const { Mixpanel } = NativeModules;

export default {
  identify(userId) {
    Mixpanel.identify(userId);
  },
  trackWithProperties(event, properties) {
    Mixpanel.trackWithProperties(event, properties);
  },
};
