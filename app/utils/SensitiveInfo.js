import SInfo from 'react-native-sensitive-info';
import constants from './constants';

const { storageNamespace } = constants;

const options = {
  sharedPreferencesName: storageNamespace, // Android
  keychainService: storageNamespace, // iOS
};

/**
 * Retrieves a value at a given key. The resolved value will be parsed as JSON.
 * @param  {String}  key The key the value is stored in
 * @return {Promise}
 */
const getItem = key => SInfo.getItem(key, options)
  .then(value => {
    try {
      return JSON.parse(value);
    } catch (err) {
      return value;
    }
  });

/**
 * Sets a value at a given key. If the value is a string, it will be stored
 * as a string. If the value is any other type, it will be stringified using
 * JSON.stringify before being stored. If value is undefined, it is a no-op.
 * @param {String} key   The key to store value in
 * @param {*}      value The value to store
 */
const setItem = (key, value) => {
  if (value === undefined) {
    return;
  }
  let _value = value;
  if (typeof _value !== 'string') {
    _value = JSON.stringify(_value);
  }
  SInfo.setItem(key, _value, options);
};

/**
 * Removes a key-value pair.
 * @param {String} key The key the value is stored in
 */
const deleteItem = key => SInfo.deleteItem(key, options);

export default { getItem, setItem, deleteItem };
