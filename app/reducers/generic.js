export default (state = {
  inProgress: null,
  connectionStatus: null,
  deviceList: null,
  deviceError: null,
}, action) => {
  switch (action.type) {
    case 'CONNECT__START': {
      return {
        ...state,
        inProgress: true,
      };
    }
    case 'CONNECT': {
      return {
        ...state,
        inProgress: false,
        connectionStatus: action.payload,
      };
    }
    case 'CONNECT_ERROR': {
      return {
        ...state,
        inProgress: false,
        deviceError: action.error.message,
      };
    }
    case 'SCAN__START': {
      return {
        ...state,
        inProgress: true,
      };
    }
    case 'SCAN': {
      return {
        ...state,
        inProgress: false,
        deviceList: action.payload,
      };
    }
    case 'SCAN__ERROR': {
      return {
        ...state,
        inProgress: false,
        deviceError: action.error.message,
      };
    }
    default:
      return state;
  }
};
