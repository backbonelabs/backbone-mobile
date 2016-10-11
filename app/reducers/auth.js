export default (state = {
  accessToken: null,
  confirmationSent: false,
  passwordResetSent: false,
  inProgress: false,
  errorMessage: null,
  userId: null,
}, action) => {
  switch (action.type) {
    case 'LOGIN__START': {
      return {
        ...state,
        inProgress: true,
        errorMessage: null,
      };
    }
    case 'LOGIN': {
      return {
        ...state,
        inProgress: false,
        errorMessage: null,
        accessToken: action.payload.accessToken,
        userId: action.payload._id,
      };
    }
    case 'LOGIN__ERROR': {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.payload.message,
      };
    }
    case 'SIGNUP__START': {
      return {
        ...state,
        inProgress: true,
        errorMessage: null,
      };
    }
    case 'SIGNUP': {
      return {
        ...state,
        inProgress: false,
        userId: action.payload.user._id,
        accessToken: action.payload.accessToken,
        confirmationSent: action.payload,
      };
    }
    case 'SIGNUP__ERROR': {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.payload.message,
      };
    }
    case 'PASSWORD_RESET__START': {
      return {
        ...state,
        inProgress: true,
        errorMessage: null,
        passwordResetSent: false,
      };
    }
    case 'PASSWORD_RESET': {
      return {
        ...state,
        inProgress: false,
        passwordResetSent: action.payload,
      };
    }
    case 'PASSWORD_RESET__ERROR': {
      return {
        ...state,
        inProgress: false,
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
