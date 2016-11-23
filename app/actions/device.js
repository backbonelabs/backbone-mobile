import { NativeModules, NativeAppEventEmitter } from 'react-native';
import constants from '../utils/constants';
import SensitiveInfo from '../utils/SensitiveInfo';

const { DeviceManagementService, DeviceInformationService } = NativeModules;

const connectStart = () => ({ type: 'DEVICE_CONNECT__START' });

const connect = payload => ({
  type: 'DEVICE_CONNECT',
  payload,
});

const connectError = payload => ({
  type: 'DEVICE_CONNECT__ERROR',
  payload,
});

function setConnectEventListener(dispatch) {
  NativeAppEventEmitter.once('ConnectionStatus', status => {
    if (status.message) {
      dispatch(connectError(status));
    } else {
      dispatch(connect(status));
    }
  });
}

const disconnectStart = () => ({ type: 'DEVICE_DISCONNECT__START' });

const disconnect = () => ({
  type: 'DEVICE_DISCONNECT',
});

const disconnectError = error => ({
  type: 'DEVICE_DISCONNECT__ERROR',
  payload: error,
});

const forgetStart = () => ({ type: 'DEVICE_FORGET__START' });

const forget = () => ({
  type: 'DEVICE_FORGET',
});

const forgetError = error => ({
  type: 'DEVICE_FORGET__ERROR',
  payload: error,
});

const getInfoStart = () => ({ type: 'DEVICE_GET_INFO__START' });

const getInfo = payload => ({
  type: 'DEVICE_GET_INFO',
  payload,
});

const getInfoError = error => ({
  type: 'DEVICE_GET_INFO__ERROR',
  payload: error,
});

const deviceActions = {
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
              dispatch(deviceActions.connect());
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
      DeviceManagementService.cancelConnection(err => {
        if (err) {
          dispatch(disconnectError(err));
        } else {
          dispatch(disconnect());
        }
      });
    };
  },
  forget() {
    return (dispatch) => {
      dispatch(forgetStart());
      DeviceManagementService.forgetDevice(err => {
        if (err) {
          dispatch(forgetError(err));
        } else {
          // Remove device information from local storage
          SensitiveInfo.deleteItem(constants.storageKeys.DEVICE);
          dispatch(forget());
        }
      });
    };
  },
  getInfo() {
    return (dispatch) => {
      dispatch(getInfoStart());
      DeviceInformationService.getDeviceInformation((err, results) => {
        if (err) {
          dispatch(getInfoError(err));
        } else {
          // Store device information in local storage
          SensitiveInfo.setItem(constants.storageKeys.DEVICE, results);
          dispatch(getInfo(results));
        }
      });
    };
  },
};

export default deviceActions;
