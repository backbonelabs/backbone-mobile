export default (state = {
  bluetoothState: null,
}, action) => {
  switch (action.type) {
    case 'UPDATE_BLUETOOTH_STATE': {
      return {
        bluetoothState: action.payload,
      };
    }
    default:
      return state;
  }
};
