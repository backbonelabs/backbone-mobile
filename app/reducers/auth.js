import {
  LOGIN,
  LOGIN__START,
  LOGIN__ERROR,
  SIGNUP,
  SIGNUP__START,
  SIGNUP__ERROR,
  SIGN_OUT,
  PASSWORD_RESET,
  PASSWORD_RESET__START,
  PASSWORD_RESET__ERROR,
  SET_ACCESS_TOKEN,
} from '../actions/types';

export default (state = {
  accessToken: null,
  passwordResetSent: false,
  inProgress: false,
  errorMessage: null,
  userId: null,
}, action) => {
  switch (action.type) {
    case LOGIN__START: {
      return {
        ...state,
        inProgress: true,
        errorMessage: null,
      };
    }
    case LOGIN: {
      return {
        ...state,
        inProgress: false,
        errorMessage: null,
        accessToken: action.payload.accessToken,
        userId: action.payload._id,
      };
    }
    case LOGIN__ERROR: {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.payload.message,
      };
    }
    case SIGNUP__START: {
      return {
        ...state,
        inProgress: true,
        errorMessage: null,
      };
    }
    case SIGNUP: {
      return {
        ...state,
        inProgress: false,
        userId: action.payload.user._id,
        accessToken: action.payload.accessToken,
      };
    }
    case SIGNUP__ERROR: {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.payload.message,
      };
    }
    case SIGN_OUT: {
      return {
        ...state,
        accessToken: null,
        passwordResetSent: false,
        inProgress: false,
        errorMessage: null,
        userId: null,
      };
    }
    case PASSWORD_RESET__START: {
      return {
        ...state,
        inProgress: true,
        errorMessage: null,
        passwordResetSent: false,
      };
    }
    case PASSWORD_RESET: {
      return {
        ...state,
        inProgress: false,
        passwordResetSent: action.payload,
      };
    }
    case PASSWORD_RESET__ERROR: {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.payload.message,
      };
    }
    case SET_ACCESS_TOKEN: {
      return {
        ...state,
        accessToken: action.payload,
      };
    }
    default:
      return state;
  }
};
