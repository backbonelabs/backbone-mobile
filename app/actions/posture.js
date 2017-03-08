export default {
  setSessionTime(seconds) {
    return {
      type: 'SET_SESSION_TIME',
      payload: seconds,
    };
  },
  setSessionDate(date) {
    return {
      type: 'SET_SESSION_DATE',
      payload: date,
    };
  },
};
