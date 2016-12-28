import { NativeModules } from 'react-native';

const { Mixpanel, BluetoothService } = NativeModules;

export default {
  /**
   * Associates all future events with the specified user id
   * @param  {String}  userId  User account id
   */
  identify(userId) {
    Mixpanel.identify(userId);
  },

  /**
   * Sets the user's profile properties on Mixpanel
   * @param  {Object}  userDetails  User profile properties
   */
  set(userDetails) {
    Mixpanel.set(userDetails);
  },

  /**
   * Tracks an event
   * @param  {String}  event  Event name
   */
  track(event) {
    Mixpanel.track(event);
  },

  /**
   * Tracks an event with properties
   * @param  {String}  event       Event name
   * @param  {Object}  properties  An object containing properties relevant to the event
   */
  trackWithProperties(event, properties) {
    Mixpanel.trackWithProperties(event, properties);
  },

  /**
   * Tracks an error event
   * @param  {Object}  properties  An object containing properties relevant to the event
   */
  trackError(properties) {
    // Track Bluetooth status to identify potential BT-related issues
    BluetoothService.getState((error, state) => {
      Mixpanel.trackWithProperties('reactNativeError', {
        bluetoothState: error || state.state,
        ...properties,
      });
    });
  },
};
