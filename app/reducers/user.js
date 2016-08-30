export default (state = {
  isUpdating: false,
  user: null,
  errorMessage: null,
}, action) => {
  switch (action.type) {
    case 'UPDATE_PROFILE__START': {
      return {
        ...state,
        isUpdating: true,
        errorMessage: null,
      };
    }
    case 'UPDATE_PROFILE': {
      return {
        ...state,
        isUpdating: false,
        errorMessage: null,
        user: action.payload,
      };
    }
    case 'UPDATE_PROFILE__ERROR': {
      return {
        ...state,
        isUpdating: false,
        errorMessage: action.payload.message,
      };
    }
    default:
      return state;
  }
};
