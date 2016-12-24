import { NativeModules } from 'react-native';

const { Mixpanel, BluetoothService } = NativeModules;

export default {
  identify(userId) {
    Mixpanel.identify(userId);
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
