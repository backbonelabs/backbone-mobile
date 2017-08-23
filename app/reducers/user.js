import omit from 'lodash/omit';
import {
  LOGIN,
  FETCH_USER,
  FETCH_USER__START,
  FETCH_USER__ERROR,
  UPDATE_USER,
  UPDATE_USER__START,
  UPDATE_USER__ERROR,
  UPDATE_USER_SETTINGS,
  UPDATE_USER_SETTINGS__START,
  UPDATE_USER_SETTINGS__ERROR,
  FETCH_USER_SESSIONS,
  FETCH_USER_SESSIONS__START,
  FETCH_USER_SESSIONS__ERROR,
  SIGNUP,
  SIGN_OUT,
  PREPARE_USER_UPDATE,
  UPDATE_USER_TRAINING_PLAN_PROGRESS,
  UPDATE_USER_TRAINING_PLAN_PROGRESS__START,
  UPDATE_USER_TRAINING_PLAN_PROGRESS__ERROR,
} from '../actions/types';

export default (state = {
  isFetching: false,
  isUpdating: false,
  user: {},
  pendingUser: null,
  errorMessage: null,
  sessions: [],
  isFetchingSessions: false,
}, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOGIN: {
      return {
        ...state,
        user: omit(payload, 'accessToken'),
      };
    }
    case FETCH_USER__START: {
      return {
        ...state,
        isFetching: true,
        errorMessage: null,
      };
    }
    case FETCH_USER: {
      return {
        ...state,
        isFetching: false,
        user: payload,
        errorMessage: null,
      };
    }
    case FETCH_USER__ERROR: {
      return {
        ...state,
        isFetching: false,
        errorMessage: payload.message,
      };
    }
    case UPDATE_USER__START:
    case UPDATE_USER_TRAINING_PLAN_PROGRESS__START: {
      return {
        ...state,
        isUpdating: true,
        errorMessage: null,
      };
    }
    case UPDATE_USER:
    case UPDATE_USER_TRAINING_PLAN_PROGRESS: {
      return {
        ...state,
        isUpdating: false,
        errorMessage: null,
        user: payload,
        pendingUser: null,
      };
    }
    case UPDATE_USER__ERROR:
    case UPDATE_USER_TRAINING_PLAN_PROGRESS__ERROR: {
      return {
        ...state,
        isUpdating: false,
        errorMessage: payload.message,
      };
    }
    case UPDATE_USER_SETTINGS__START: {
      return {
        ...state,
        isUpdating: true,
        errorMessage: null,
      };
    }
    case UPDATE_USER_SETTINGS: {
      return {
        ...state,
        isUpdating: false,
        user: {
          ...state.user,
          settings: payload,
        },
        errorMessage: null,
      };
    }
    case UPDATE_USER_SETTINGS__ERROR: {
      return {
        ...state,
        isUpdating: false,
        errorMessage: payload.message,
        user: {
          ...state.user,
          settings: payload.settings || state.user.settings,
        },
      };
    }
    case FETCH_USER_SESSIONS: {
      return {
        ...state,
        isFetchingSessions: false,
        errorMessage: null,
        sessions: payload,
      };
    }
    case FETCH_USER_SESSIONS__START: {
      return {
        ...state,
        isFetchingSessions: true,
        errorMessage: null,
      };
    }
    case FETCH_USER_SESSIONS__ERROR: {
      return {
        ...state,
        isFetchingSessions: false,
        errorMessage: payload.message,
      };
    }
    case SIGNUP: {
      return {
        ...state,
        user: payload.user,
      };
    }
    case SIGN_OUT: {
      return {
        ...state,
        isFetching: false,
        isUpdating: false,
        user: {},
        pendingUser: null,
        errorMessage: null,
      };
    }
    case PREPARE_USER_UPDATE: {
      return {
        ...state,
        pendingUser: payload,
      };
    }
    default:
      return state;
  }
};
