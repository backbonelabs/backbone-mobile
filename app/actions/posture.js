export default {
  setSessionTime(seconds) {
    return {
      type: 'SET_SESSION_TIME',
      payload: seconds,
    };
  },
};
