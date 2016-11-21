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
