import {
  UPDATE_SUPPORT_MESSAGE,
  CREATE_SUPPORT_TICKET,
  CREATE_SUPPORT_TICKET__START,
  CREATE_SUPPORT_TICKET__ERROR,
  RESEND_CONFIRMATION_EMAIL,
  RESEND_CONFIRMATION_EMAIL__START,
  RESEND_CONFIRMATION_EMAIL__ERROR,
} from '../actions/types';

export default (state = {
  inProgress: false,
  supportMessage: null,
  errorMessage: null,
}, action) => {
  switch (action.type) {
    case UPDATE_SUPPORT_MESSAGE: {
      return {
        ...state,
        supportMessage: action.payload,
      };
    }
    case CREATE_SUPPORT_TICKET__START: {
      return {
        ...state,
        inProgress: true,
        errorMessage: null,
      };
    }
    case CREATE_SUPPORT_TICKET: {
      return {
        ...state,
        inProgress: false,
        supportMessage: null,
      };
    }
    case CREATE_SUPPORT_TICKET__ERROR: {
      return {
        ...state,
        inProgress: false,
        errorMessage: action.payload.message,
      };
    }
    case RESEND_CONFIRMATION_EMAIL__START: {
      return {
        ...state,
        inProgress: true,
        errorMessage: null,
      };
    }
    case RESEND_CONFIRMATION_EMAIL: {
      return {
        ...state,
        inProgress: false,
      };
    }
    case RESEND_CONFIRMATION_EMAIL__ERROR: {
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
