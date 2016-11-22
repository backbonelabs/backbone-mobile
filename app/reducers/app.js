import { isString, mapValues } from 'lodash';

export default (state = {
  bluetoothState: null,
  config: {},
  inProgress: false,
  isConnected: false,
  errorMessage: null,
  modal: {
    show: false,
    content: null,
    onClose: null,
  },
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
        isConnected: false,
        errorMessage: null,
      };
    }
    case 'CONNECT': {
      return {
        ...state,
        inProgress: false,
        isConnected: action.payload.isConnected,
      };
    }
    case 'CONNECT__ERROR': {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.payload.message,
      };
    }
    case 'DISCONNECT__START': {
      return {
        ...state,
        inProgress: true,
        errorMessage: null,
      };
    }
    case 'DISCONNECT': {
      return {
        ...state,
        inProgress: false,
        isConnected: false,
      };
    }
    case 'DISCONNECT__ERROR': {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.payload.message,
      };
    }
    case 'SHOW_FULL_MODAL': {
      const { content, onClose } = action.payload;
      return {
        ...state,
        modal: {
          show: true,
          content,
          onClose,
        },
      };
    }
    case 'HIDE_FULL_MODAL': {
      return {
        ...state,
        modal: {
          show: false,
          content: null,
          onClose: null,
        },
      };
    }
    default:
      return state;
  }
};
