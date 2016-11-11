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

function setConnectEventListener(dispatch) {
  NativeAppEventEmitter.once('ConnectionStatus', status => {
    if (status.isConnected) {
      dispatch(connect(status));
    } else {
      dispatch(connectError(status));
    }
  });
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
      setConnectEventListener(dispatch);
      DeviceManagementService.connectToDevice();
    };
  },
  showFullModal(modalConfig) {
    return {
      type: 'SHOW_FULL_MODAL',
      payload: modalConfig,
    };
  },
  hideFullModal() {
    return { type: 'HIDE_FULL_MODAL' };
  },
};
