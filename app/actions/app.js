import { NativeModules, NativeAppEventEmitter } from 'react-native';
import constants from '../utils/constants';

const { DeviceManagementService } = NativeModules;

const connectStart = () => ({ type: 'CONNECT__START' });

const connect = payload => ({
  type: 'CONNECT',
  payload,
});

const connectError = error => ({
  type: 'CONNECT__ERROR',
  error: true,
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

const disconnectStart = () => ({ type: 'DISCONNECT__START' });

const disconnect = () => ({
  type: 'DISCONNECT',
});

const disconnectError = error => ({
  type: 'DISCONNECT__ERROR',
  payload: error,
  error: true,
});

const appActions = {
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
  attemptAutoConnect() {
    return (dispatch) => {
      // Check current connection status with Backbone device
      DeviceManagementService.getDeviceStatus((status) => {
        if (status === constants.deviceStatuses.CONNECTED) {
          // Device is connected
          dispatch(connect({ isConnected: true }));
        } else {
          // Device is not connected, check whether there is a saved device
          DeviceManagementService.getSavedDevice((device) => {
            if (device) {
              // There is a saved device, attempt to connect
              dispatch(appActions.connect());
            }
            // Do nothing if there is no saved device
          });
        }
      });
    };
  },
  disconnect() {
    return (dispatch) => {
      dispatch(disconnectStart());
      DeviceManagementService.forgetDevice(err => {
        if (err) {
          dispatch(disconnectError(err));
        } else {
          dispatch(disconnect());
        }
      });
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

export default appActions;
