export default {
  setSessionTime(seconds) {
    return {
      type: 'SET_SESSION_TIME',
      payload: seconds,
    };
  },
  decreaseSessionTime() {
    return {
      type: 'DECREASE_SESSION_TIME',
    };
  },
};
