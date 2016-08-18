export default (state = {
  accessToken: null,
  isFetchingAccessToken: false,
  isFetchingAccessTokenComplete: false,
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
        isFetchingAccessTokenComplete: true,
        errorMessage: null,
        accessToken: action.payload.accessToken,
      };
    }
    case 'FETCH_ACCESS_TOKEN__ERROR': {
      return {
        ...state,
        isFetchingAccessToken: false,
        isFetchingAccessTokenComplete: false,
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
        isVerifyingAccessTokenComplete: true,
        errorMessage: null,
        isValidAccessToken: action.payload,
      };
    }
    case 'VERIFY_ACCESS_TOKEN__ERROR': {
      return {
        ...state,
        isVerifyingAccessToken: false,
        isVerifyingAccessTokenComplete: false,
        errorMessage: action.payload.message,
      };
    }
    default:
      return state;
  }
};
