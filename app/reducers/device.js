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
  DEVICE_SELF_TEST_REQUESTED,
  DEVICE_SELF_TEST_UPDATED,
  DEVICE_RESTORE_SAVED_SESSION,
  DEVICE_CLEAR_SAVED_SESSION,
  DEVICE_FIRMWARE_UPDATE_STARTED,
  DEVICE_FIRMWARE_UPDATE_ENDED,
} from '../actions/types';

export default (state = {
  inProgress: false,
  device: {},
  isConnecting: false,
  isConnected: false,
  hasSavedSession: false,
  selfTestStatus: false,
  errorMessage: null,
  requestingSelfTest: false,
  isUpdatingFirmware: false,
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
        selfTestStatus: false,
        isUpdatingFirmware: false,
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
    case DEVICE_SELF_TEST_REQUESTED: {
      return {
        ...state,
        requestingSelfTest: true,
        selfTestStatus: false,
      };
    }
    case DEVICE_SELF_TEST_UPDATED: {
      return {
        ...state,
        requestingSelfTest: false,
        selfTestStatus: action.payload,
      };
    }
    case DEVICE_RESTORE_SAVED_SESSION: {
      return {
        ...state,
        hasSavedSession: true,
      };
    }
    case DEVICE_CLEAR_SAVED_SESSION: {
      return {
        ...state,
        hasSavedSession: false,
      };
    }
    case DEVICE_FIRMWARE_UPDATE_STARTED: {
      return {
        ...state,
        isUpdatingFirmware: true,
      };
    }
    case DEVICE_FIRMWARE_UPDATE_ENDED: {
      return {
        ...state,
        isUpdatingFirmware: false,
      };
    }
    default:
      return state;
  }
};
