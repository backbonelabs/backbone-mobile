export default (state = {
  accessToken: null,
  isFetchingAccessToken: false,
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
        isFetchingAccessToken: true,
      };
    }
    case 'SIGNUP': {
      return {
        ...state,
        userId: action.payload._id,
        accessToken: action.payload.accessToken,
        isFetchingAccessToken: false,
      };
    }
    case 'SIGNUP__ERROR': {
      return {
        ...state,
        errorMessage: action.payload.message,
        isFetchingAccessToken: false,
      };
    }
    default:
      return state;
  }
};
