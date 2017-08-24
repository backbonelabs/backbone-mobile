import { omit } from 'lodash';

export default (state = {
  isFetching: false,
  isUpdating: false,
  user: {},
  pendingUser: null,
  errorMessage: null,
  sessions: [],
  workouts: [],
  isFetchingSessions: false,
  isFetchingWorkouts: false,
}, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'LOGIN': {
      return {
        ...state,
        user: omit(payload, 'accessToken'),
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
        user: payload,
        errorMessage: null,
      };
    }
    case 'FETCH_USER__ERROR': {
      return {
        ...state,
        isFetching: false,
        errorMessage: payload.message,
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
        user: payload,
        pendingUser: null,
      };
    }
    case 'UPDATE_USER__ERROR': {
      return {
        ...state,
        isUpdating: false,
        errorMessage: payload.message,
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
          settings: payload,
        },
        errorMessage: null,
      };
    }
    case 'UPDATE_USER_SETTINGS__ERROR': {
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
    case 'FETCH_USER_SESSIONS': {
      return {
        ...state,
        isFetchingSessions: false,
        errorMessage: null,
        sessions: payload,
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
        errorMessage: payload.message,
      };
    }
    case 'SIGNUP': {
      return {
        ...state,
        user: payload.user,
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
        pendingUser: payload,
      };
    }
    case 'FETCH_USER_WORKOUTS': {
      return {
        ...state,
        isFetchingWorkouts: false,
        errorMessage: null,
        workouts: payload,
      };
    }
    case 'FETCH_USER_WORKOUTS__START': {
      return {
        ...state,
        isFetchingWorkouts: true,
        errorMessage: null,
      };
    }
    case 'FETCH_USER_WORKOUTS__ERROR': {
      return {
        ...state,
        isFetchingWorkouts: false,
        errorMessage: payload.message,
      };
    }
    default:
      return state;
  }
};
