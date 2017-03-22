import {
  DEVICE_CONNECT__START,
  DEVICE_CONNECT__ERROR,
  DEVICE_CONNECT_STATUS,
  DEVICE_CONNECT_STATUS__ERROR,
  DEVICE_DISCONNECT,
  DEVICE_DISCONNECT__START,
  DEVICE_DISCONNECT__ERROR,
  DEVICE_FORGET,
  DEVICE_FORGET__START,
  DEVICE_FORGET__ERROR,
  DEVICE_GET_INFO,
  DEVICE_GET_INFO__START,
  DEVICE_GET_INFO__ERROR,
} from '../actions/types';

export default (state = {
  inProgress: false,
  device: {},
  isConnecting: false,
  isConnected: false,
  errorMessage: null,
}, action) => {
  switch (action.type) {
    case DEVICE_CONNECT__START: {
      return {
        ...state,
        isConnecting: true,
        isConnected: false,
        errorMessage: null,
      };
    }
    case DEVICE_CONNECT__ERROR: {
      return {
        ...state,
        isConnecting: false,
        errorMessage: action.payload.message,
      };
    }
    case DEVICE_CONNECT_STATUS: {
      return {
        ...state,
        isConnecting: false,
        isConnected: action.payload.isConnected,
      };
    }
    case DEVICE_CONNECT_STATUS__ERROR: {
      return {
        ...state,
        isConnecting: false,
        errorMessage: action.payload.message,
      };
    }
    case DEVICE_DISCONNECT__START: {
      return {
        ...state,
        inProgress: true,
        errorMessage: null,
      };
    }
    case DEVICE_DISCONNECT: {
      return {
        ...state,
        inProgress: false,
        isConnected: false,
      };
    }
    case DEVICE_DISCONNECT__ERROR: {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.payload.message,
      };
    }
    case DEVICE_FORGET__START: {
      return {
        ...state,
        inProgress: true,
        errorMessage: null,
      };
    }
    case DEVICE_FORGET: {
      return {
        ...state,
        inProgress: false,
        isConnected: false,
        device: {},
      };
    }
    case DEVICE_FORGET__ERROR: {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.payload.message,
      };
    }
    case DEVICE_GET_INFO__START: {
      return {
        ...state,
        inProgress: true,
        errorMessage: null,
      };
    }
    case DEVICE_GET_INFO: {
      return {
        ...state,
        inProgress: false,
        device: action.payload,
      };
    }
    case DEVICE_GET_INFO__ERROR: {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.payload.message,
      };
    }
    default:
      return state;
  }
};
