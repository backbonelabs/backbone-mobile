export default (state = {
  accessToken: null,
  isSignedup: false,
  isFetchingAccessToken: false,
  isCreatingUserAccount: false,
  isCheckingConfirmation: false,
  errorMessage: null,
  isVerifyingAccessToken: false,
  isValidAccessToken: false,
}, action) => {
  switch (action.type) {
    case 'FETCH_ACCESS_TOKEN__START': {
      return {
        ...state,
        isFetchingAccessToken: true,
        errorMessage: null,
      };
    }
    case 'FETCH_ACCESS_TOKEN': {
      return {
        ...state,
        isFetchingAccessToken: false,
        errorMessage: null,
        accessToken: action.payload.accessToken,
      };
    }
    case 'FETCH_ACCESS_TOKEN__ERROR': {
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
    case 'CHECK_CONFIRMATION__START': {
      return {
        ...state,
        isCheckingConfirmation: true,
        errorMessage: null,
      };
    }
    case 'CHECK_CONFIRMATION': {
      return {
        ...state,
        isCheckingConfirmation: false,
        errorMessage: null,
        accessToken: action.payload.accessToken,
      };
    }
    case 'CHECK_CONFIRMATION__ERROR': {
      return {
        ...state,
        isCheckingConfirmation: false,
        errorMessage: action.payload.message,
      };
    }
    case 'RESEND_CONFIRMATION__START': {
      return {
        ...state,
        isResendingConfirmation: true,
        errorMessage: null,
      };
    }
    case 'RESEND_CONFIRMATION': {
      return {
        ...state,
        isResendingConfirmation: false,
        errorMessage: null,
      };
    }
    case 'RESEND_CONFIRMATION__ERROR': {
      return {
        ...state,
        isResendingConfirmation: false,
        errorMessage: action.payload.message,
      };
    }
    case 'VERIFY_ACCESS_TOKEN__START': {
      return {
        ...state,
        isVerifyingAccessToken: true,
        errorMessage: null,
      };
    }
    case 'VERIFY_ACCESS_TOKEN': {
      return {
        ...state,
        isVerifyingAccessToken: false,
        errorMessage: null,
        isValidAccessToken: action.payload,
      };
    }
    case 'VERIFY_ACCESS_TOKEN__ERROR': {
      return {
        ...state,
        isVerifyingAccessToken: false,
        errorMessage: action.payload.message,
      };
    }
    default:
      return state;
  }
};
