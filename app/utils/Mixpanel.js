import { NativeModules } from 'react-native';
import { map } from 'lodash';
import constants from './constants';

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
   * Formats the user profile properties before setting on Mixpanel
   * @param  {Object}  userDetails  User profile properties
   */
  setUserProperties(user) {
    const userClone = Object.assign({ ...user }, { ...user.settings });
    const { gender, heightUnitPreference, weightUnitPreference } = user;
    const { height, weight } = constants;
    const formattedGender = gender === constants.gender.male ? 'male' : 'female';

    // Delete unwanted profile properties
    [
      '_id',
      'confirmationToken',
      'confirmationTokenExpiry',
      'firstName',
      'lastName',
      'nickname',
      'settings',
    ].forEach(value => {
      delete userClone[value];
    });


    map(userClone, (value, key) => {
      if (value || value === false) {
        if (key === 'email') {
          // Set Mixpanel special property $email and delete unused email property
          userClone.$email = user[key];
          delete userClone[key];
        } else if (value && key === 'gender') {
          // Change gender from integer to word equivalent ("male" / "female")
          userClone.gender = formattedGender;
        } else if (key === 'height') {
          // Change heightUnitPreference from integer to word equivalent ("IN" / "CM")
          userClone.heightUnitPreference = heightUnitPreference === height.units.IN ? 'IN' : 'CM';
        } else if (key === 'weight') {
          // Change heightUnitPreference from integer to word equivalent ("LB" / "KG")
          userClone.weightUnitPreference = weightUnitPreference === weight.units.LB ? 'LB' : 'KG';
        }
      } else {
        if (key === 'weight' || key === 'height') {
          // These unit preference properties will never be undefined
          // Remove them if their measurement values are undefined
          delete userClone[`${key}UnitPreference`];
        }

        // Remove properties with undefined values
        delete userClone[key];
      }
    });

    this.set(userClone);
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
   * Tracks an error event and its properties
   * @param  {Object}  properties  An error event property object which contains the error message,
   *                               stack trace, file path, bluetooth state properties, and anything
   *                               else that you feel would be relevant to the error event.
   */
  trackError(properties) {
    // Track Bluetooth status to identify potential BT-related issues
    BluetoothService.getState((error, { state }) => {
      Mixpanel.trackWithProperties('reactNativeError', {
        bluetoothState: state,
        ...properties,
      });
    });
  },

  /**
   * Registers super properties, which Mixpanel will include with every event
   * @param  {Object}  properties  An object containing properties to pass on every event
   */
  registerSuperProperties(properties) {
    Mixpanel.registerSuperProperties(properties);
  },
};
