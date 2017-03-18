import { omit } from 'lodash';

export default (state = {
  isFetching: false,
  isUpdating: false,
  user: {},
  pendingUser: null,
  errorMessage: null,
  sessions: [],
  isFetchingSessions: false,
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
        pendingUser: null,
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
          settings: action.payload,
        },
        errorMessage: null,
      };
    }
    case 'UPDATE_USER_SETTINGS__ERROR': {
      return {
        ...state,
        isUpdating: false,
        errorMessage: action.payload.message,
        user: {
          ...state.user,
          settings: action.payload.settings || state.user.settings,
        },
      };
    }
    case 'FETCH_USER_SESSIONS': {
      return {
        ...state,
        isFetchingSessions: false,
        errorMessage: null,
        sessions: action.payload,
      };
    }
    case 'FETCH_USER_SESSIONS__START': {
      return {
        ...state,
        isFetchingSessions: true,
        errorMessage: null,
      };
    }
    case 'FETCH_USER_SESSIONS__ERROR': {
      return {
        ...state,
        isFetchingSessions: false,
        errorMessage: action.payload.message,
      };
    }
    case 'SIGNUP': {
      return {
        ...state,
        user: action.payload.user,
      };
    }
    case 'SIGN_OUT': {
      return {
        ...state,
        isFetching: false,
        isUpdating: false,
        user: {},
        pendingUser: null,
        errorMessage: null,
      };
    }
    case 'PREPARE_USER_UPDATE': {
      return {
        ...state,
        pendingUser: action.payload,
      };
    }
    default:
      return state;
  }
};
