import { isString, mapValues } from 'lodash';

export default (state = {
  bluetoothState: null,
  config: {},
}, action) => {
  switch (action.type) {
    case 'UPDATE_BLUETOOTH_STATE': {
      return {
        ...state,
        bluetoothState: action.payload,
      };
    }
    case 'SET_CONFIG': {
      // Convert string true/false values to primitive boolean
      const transformedConfig = mapValues(action.payload, value => {
        if (isString(value)) {
          const _value = value.toLowerCase();
          if (_value === 'true') {
            return true;
          } else if (_value === 'false') {
            return false;
          }
        }
        return value;
      });

      return {
        ...state,
        config: transformedConfig,
      };
    }
    default:
      return state;
  }
};
