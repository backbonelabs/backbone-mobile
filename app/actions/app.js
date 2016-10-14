import { NativeModules, NativeAppEventEmitter } from 'react-native';

const { DeviceManagementService } = NativeModules;

const connectStart = () => ({ type: 'CONNECT__START' });

const connect = payload => ({
  type: 'CONNECT',
  payload,
});

const connectError = error => ({
  type: 'CONNECT__ERROR',
  error,
});

function connectEventListener(dispatch) {
  const eventListener = NativeAppEventEmitter.once('ConnectionStatus', status => {
    if (status.isConnected) {
      dispatch(connect(status));
    } else {
      dispatch(connectError(status));
    }
  });

  return eventListener;
}

export default {
  setConfig(config) {
    return {
      type: 'SET_CONFIG',
      payload: config,
    };
  },
  connect() {
    return (dispatch) => {
      dispatch(connectStart());
      connectEventListener(dispatch);
      DeviceManagementService.connectToDevice();
    };
  },
};
