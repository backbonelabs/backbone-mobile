import { isEmpty } from 'lodash';

export default (state = {
  inProgress: false,
  device: null,
  isConnected: false,
  errorMessage: null,
}, action) => {
  switch (action.type) {
    case 'DEVICE_CONNECT__START': {
      return {
        ...state,
        inProgress: true,
        isConnected: false,
        errorMessage: null,
      };
    }
    case 'DEVICE_CONNECT': {
      return {
        ...state,
        inProgress: false,
        isConnected: action.payload.isConnected,
      };
    }
    case 'DEVICE_CONNECT__ERROR': {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.payload.message,
      };
    }
    case 'DEVICE_GET_INFO__START': {
      return {
        ...state,
        inProgress: true,
        errorMessage: null,
      };
    }
    case 'DEVICE_GET_INFO': {
      return {
        ...state,
        inProgress: false,
        isConnected: true,
        device: isEmpty(action.payload) ? null : action.payload,
      };
    }
    default:
      return state;
  }
};
