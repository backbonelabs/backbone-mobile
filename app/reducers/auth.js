export default (state = {
  accessToken: null,
  isSignedup: false,
  isConfirmed: false,
  isFetchingAccessToken: false,
  isCreatingUserAccount: false,
  isCheckingEmailConfirmation: false,
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
    case 'CREATE_USER_ACCOUNT__START': {
      return {
        ...state,
        isCreatingUserAccount: true,
        errorMessage: null,
      };
    }
    case 'CREATE_USER_ACCOUNT': {
      return {
        ...state,
        isCreatingUserAccount: false,
        errorMessage: null,
        isSignedup: action.payload,
      };
    }
    case 'CREATE_USER_ACCOUNT__ERROR': {
      return {
        ...state,
        isCreatingUserAccount: false,
        errorMessage: action.payload.message,
      };
    }
    case 'CHECK_EMAIL_CONFIRMATION__START': {
      return {
        ...state,
        isCheckingEmailConfirmation: true,
        errorMessage: null,
      };
    }
    case 'CHECK_EMAIL_CONFIRMATION': {
      return {
        ...state,
        isCheckingEmailConfirmation: false,
        errorMessage: null,
        isConfirmed: action.payload,
      };
    }
    case 'CHECK_EMAIL_CONFIRMATION__ERROR': {
      return {
        ...state,
        isCheckingEmailConfirmation: false,
        errorMessage: action.payload.message,
      };
    }
    default:
      return state;
  }
};
