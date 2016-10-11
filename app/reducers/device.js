export default (state = {
  inProgress: null,
  connectionStatus: null,
  deviceList: null,
  errorMessage: null,
}, action) => {
  switch (action.type) {
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
    case 'SCAN__START': {
      return {
        ...state,
        inProgress: true,
        deviceList: null,
        errorMessage: null,
      };
    }
    case 'SCAN': {
      return {
        ...state,
        deviceList: action.payload,
      };
    }
    case 'SCAN__ERROR': {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.error.message,
      };
    }
    case 'SELECT_DEVICE__ERROR': {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.error.message,
      };
    }
    case 'FORGET': {
      return {
        ...state,
        inProgress: false,
        connectionStatus: null,
      };
    }
    case 'FORGET__ERROR': {
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
