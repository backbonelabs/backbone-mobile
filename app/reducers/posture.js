export default (state = {
  sessionTimeSeconds: null,
  remainingTimeSeconds: null,
}, action) => {
  switch (action.type) {
    case 'SET_SESSION_TIME': {
      return {
        ...state,
        sessionTimeSeconds: action.payload,
        remainingTimeSeconds: action.payload,
      };
    }
    case 'DECREASE_SESSION_TIME': {
      return {
        ...state,
        remainingTimeSeconds: state.remainingTimeSeconds ? state.remainingTimeSeconds - 1 : state.remainingTimeSeconds,
      };
    }
    default:
      return state;
  }
};
