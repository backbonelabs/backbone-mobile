export default (state = {
  user: null,
  isFetching: false,
  isFetchingComplete: false,
  errorMessage: null,
}, action) => {
  switch (action.type) {
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
        user: action.payload,
      };
    }
    case 'FETCH_USER__ERROR': {
      return {
        ...state,
        isSubmitting: false,
        isSubmittingComplete: false,
        errorMessage: action.payload.message,
      };
    }
    default:
      return state;
  }
};
