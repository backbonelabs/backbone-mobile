import { isString, mapValues } from 'lodash';

export default (state = {
  bluetoothState: null,
  config: {},
  inProgress: false,
  connectionStatus: null,
  errorMessage: null,
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
    case 'CONNECT__START': {
      return {
        ...state,
        inProgress: true,
        connectionStatus: null,
        errorMessage: null,
      };
    }
    case 'CONNECT': {
      return {
        ...state,
        inProgress: false,
        connectionStatus: action.payload,
      };
    }
    case 'CONNECT__ERROR': {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.error.message,
      };
    }
    default:
      return state;
  }
};
