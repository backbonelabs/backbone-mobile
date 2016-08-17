export default (state = {
  accessToken: null,
  isFetching: false,
  isFetchingComplete: false,
  errorMessage: null,
}, action) => {
  switch (action.type) {
    case 'FETCH_ACCESS_TOKEN__START': {
      return {
        ...state,
        isFetching: true,
        errorMessage: null,
      };
    }
    case 'FETCH_ACCESS_TOKEN': {
      return {
        ...state,
        isFetching: false,
        isFetchingComplete: true,
        errorMessage: null,
        accessToken: action.payload.accessToken,
      };
    }
    case 'FETCH_ACCESS_TOKEN__ERROR': {
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
