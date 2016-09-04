import { omit } from 'lodash';

export default (state = {
  isFetching: false,
  isUpdating: false,
  user: null,
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
    case 'FETCH_USER_SETTINGS__START': {
      return {
        ...state,
        isFetching: true,
        errorMessage: null,
      };
    }
    case 'FETCH_USER_SETTINGS': {
      return {
        ...state,
        isFetching: false,
        user: action.payload,
        errorMessage: null,
      };
    }
    case 'FETCH_USER_SETTINGS__ERROR': {
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
        isFetching: true,
        errorMessage: null,
      };
    }
    case 'UPDATE_USER_SETTINGS': {
      return {
        ...state,
        isFetching: false,
        user: action.payload,
        errorMessage: null,
      };
    }
    case 'UPDATE_USER_SETTINGS__ERROR': {
      return {
        ...state,
        isFetching: false,
        errorMessage: action.payload.message,
      };
    }
    case 'CHECK_EMAIL_CONFIRMATION': {
      return {
        ...state,
        user: omit(action.payload, 'accessToken'),
      };
    }
    default:
      return state;
  }
};
