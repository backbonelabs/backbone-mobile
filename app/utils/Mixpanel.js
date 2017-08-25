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
    const { gender, height, weight } = constants;

    let userGender = 'male';
    if (user.gender === gender.female) {
      userGender = 'female';
    } else if (user.gender === gender.other) {
      userGender = 'other';
    }
    // Specify Mixpanel profile properties to set
    const userProperties = {
      $email: user.email,
      gender: userGender,
      $created: user.createdAt,
      height: user.height,
      heightUnitPreference: user.heightUnitPreference === height.units.IN ? 'IN' : 'CM',
      weight: user.weight,
      weightUnitPreference: user.weightUnitPreference === weight.units.LB ? 'LB' : 'KG',
      birthdate: user.birthdate,
      dailyStreak: user.dailyStreak,
      hasOnboarded: user.hasOnboarded,
      seenBaselineSurvey: user.seenBaselineSurvey,
      isConfirmed: user.isConfirmed,
      lastSession: user.lastSession,
      ...user.settings,
    };

    // Remove empty properties
    map(userProperties, (value, key) => {
      if (value === undefined || value === null) {
        delete userProperties[key];
        if (key === 'weight' || key === 'height') {
          // Remove unit preferences if their measurement values are not defined
          delete userProperties[`${key}UnitPreference`];
        }
      }
    });

    // Set Mixpanel profile properties
    this.set(userProperties);
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

  /**
   * Registers super properties without overriding previously registered ones
   * @param  {Object}  properties  An object containing properties to pass on every event
   */
  registerSuperPropertiesOnce(properties) {
    Mixpanel.registerSuperPropertiesOnce(properties);
  },

  /**
   * Unregisters super property specified by the property name
   * @param  {String}  propertyName  The property name to be unregistered
   */
  unregisterSuperProperty(propertyName) {
    Mixpanel.unregisterSuperProperty(propertyName);
  },
};
