import { NativeModules } from 'react-native';

const { Mixpanel, BluetoothService } = NativeModules;

export default {
  identify(userId) {
    Mixpanel.identify(userId);
  },
  set(userDetails) {
    Mixpanel.set(userDetails);
  },
  track(event) {
    Mixpanel.track(event);
  },
  trackWithProperties(event, properties) {
    Mixpanel.trackWithProperties(event, properties);
  },
  trackError(properties) {
    // Track Bluetooth status to identify potential BT-related issues
    BluetoothService.getState((error, state) => {
      Mixpanel.trackWithProperties('reactNativeError', {
        bluetoothState: error || state,
        ...properties,
      });
    });
  },
};
