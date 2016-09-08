export default (state = {
  accessToken: null,
  confirmationSent: false,
  isFetchingAccessToken: false,
  isSigningUp: false,
  isCheckingConfirmation: false,
  errorMessage: null,
  userId: null,
}, action) => {
  switch (action.type) {
    case 'LOGIN__START': {
      return {
        ...state,
        isFetchingAccessToken: true,
        errorMessage: null,
      };
    }
    case 'LOGIN': {
      return {
        ...state,
        isFetchingAccessToken: false,
        errorMessage: null,
        accessToken: action.payload.accessToken,
        userId: action.payload._id,
      };
    }
    case 'LOGIN__ERROR': {
      return {
        ...state,
        isFetchingAccessToken: false,
        errorMessage: action.payload.message,
      };
    }
    case 'SIGNUP__START': {
      return {
        ...state,
        isSigningUp: true,
        errorMessage: null,
      };
    }
    case 'SIGNUP': {
      return {
        ...state,
        isSigningUp: false,
        errorMessage: null,
        confirmationSent: action.payload,
      };
    }
    case 'SIGNUP__ERROR': {
      return {
        ...state,
        isSigningUp: false,
        errorMessage: action.payload.message,
      };
    }
    case 'CHECK_CONFIRMATION__START': {
      return {
        ...state,
        errorMessage: null,
      };
    }
    case 'CHECK_CONFIRMATION': {
      return {
        ...state,
        errorMessage: null,
        accessToken: action.payload.accessToken,
        userId: action.payload._id,
      };
    }
    case 'CHECK_CONFIRMATION__ERROR': {
      return {
        ...state,
        errorMessage: action.payload.message,
      };
    }
    default:
      return state;
  }
};
