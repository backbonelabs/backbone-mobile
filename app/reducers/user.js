import { omit } from 'lodash';

export default (state = {
  isFetching: false,
  isUpdating: false,
  user: {},
  errorMessage: null,
}, action) => {
  switch (action.type) {
    case 'LOGIN': {
      return {
        ...state,
        user: omit(action.payload, 'accessToken'),
      };
    }
    case 'FETCH_USER__START': {
      return {
        ...state,
        isFetching: true,
        errorMessage: null,
      };
    }
    case 'FETCH_USER': {
      return {
        ...state,
        isFetching: false,
        user: action.payload,
        errorMessage: null,
      };
    }
    case 'FETCH_USER__ERROR': {
      return {
        ...state,
        isFetching: false,
        errorMessage: action.payload.message,
      };
    }
    case 'UPDATE_USER__START': {
      return {
        ...state,
        isUpdating: true,
        errorMessage: null,
      };
    }
    case 'UPDATE_USER': {
      return {
        ...state,
        isUpdating: false,
        errorMessage: null,
        user: action.payload,
      };
    }
    case 'UPDATE_USER__ERROR': {
      return {
        ...state,
        isUpdating: false,
        errorMessage: action.payload.message,
      };
    }
    case 'UPDATE_USER_SETTINGS__START': {
      return {
        ...state,
        isUpdating: true,
        errorMessage: null,
      };
    }
    case 'UPDATE_USER_SETTINGS': {
      return {
        ...state,
        isUpdating: false,
        user: {
          ...state.user,
          settings: {
            ...action.payload,
          },
        },
        errorMessage: null,
      };
    }
    case 'UPDATE_USER_SETTINGS__ERROR': {
      return {
        ...state,
        isUpdating: false,
        errorMessage: action.payload.message,
      };
    }
    case 'SIGNUP': {
      return {
        ...state,
        user: action.payload.user,
      };
    }
    case 'SIGN__OUT': {
      return {
        ...state,
        isFetching: false,
        isUpdating: false,
        user: {},
        errorMessage: null,
      };
    }
    default:
      return state;
  }
};
