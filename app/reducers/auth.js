export default (state = {
  accessToken: null,
  isFetching: false,
  isFetchingComplete: false,
  errorMessage: null,
}, action) => {
  switch (action.type) {
    case 'ACCESS_TOKEN': {
      return {
        ...state,
        accessToken: action.payload,
      };
    }
    case 'FETCH_USER__START': {
      return {
        ...state,
        isFetching: true,
      };
    }
    case 'FETCH_USER': {
      return {
        ...state,
        isFetching: false,
        isFetchingComplete: true,
        errorMessage: null,
        accessToken: action.payload.accessToken,
      };
    }
    case 'FETCH_USER__ERROR': {
      return {
        ...state,
        isFetching: false,
        isFetchingComplete: false,
        errorMessage: action.payload.message,
      };
    }
    default:
      return state;
  }
};
