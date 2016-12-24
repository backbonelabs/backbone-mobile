import { NativeModules, NativeEventEmitter } from 'react-native';
import constants from '../utils/constants';
import Mixpanel from '../utils/Mixpanel';
import SensitiveInfo from '../utils/SensitiveInfo';

const {
  DeviceManagementService,
  DeviceInformationService,
} = NativeModules;
const deviceManagementServiceEvents = new NativeEventEmitter(DeviceManagementService);
const { storageKeys } = constants;

const connectStart = () => ({ type: 'DEVICE_CONNECT__START' });

const connect = payload => ({
  type: 'DEVICE_CONNECT',
  payload,
});

const connectError = payload => ({
  type: 'DEVICE_CONNECT__ERROR',
  payload,
});

function setConnectEventListener(dispatch, getInfo) {
  const connectionStatusListener = deviceManagementServiceEvents.addListener(
    'ConnectionStatus',
    status => {
      if (status.message) {
        dispatch(connectError(status));
        Mixpanel.trackError({
          path: 'app/actions/device',
          nativeModuleMethod: `setConnectEventListener/
            deviceManagementServiceEvents.addListener`,
          errorContent: status,
        });
      } else {
        dispatch(connect(status));
        // Call getInfo to fetch latest device information
        dispatch(getInfo());
      }
      connectionStatusListener.remove();
    }
  );
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
  connect(deviceIdentifier) {
    return (dispatch) => {
      dispatch(connectStart());
      setConnectEventListener(dispatch, deviceActions.getInfo);
      // Connect to device with specified identifier
      DeviceManagementService.connectToDevice(deviceIdentifier);
    };
  },
  disconnect() {
    return (dispatch, getState) => {
      // Attempt disconnect only if device is connected
      if (getState().device.isConnected) {
        dispatch(disconnectStart());
        DeviceManagementService.cancelConnection(err => {
          if (err) {
            dispatch(disconnectError(err));
            Mixpanel.trackError({
              path: 'app/actions/device',
              nativeModuleMethod: `deviceActions.disconnect/
                DeviceManagementService.cancelConnection`,
              errorContent: err,
            });
          } else {
            dispatch(disconnect());
          }
        });
      }
    };
  },
  forget() {
    return (dispatch) => {
      dispatch(forgetStart());
      // Disconnect device before attempting to forget
      DeviceManagementService.cancelConnection(err => {
        if (err) {
          dispatch(forgetError(err));
          Mixpanel.trackError({
            path: 'app/actions/device',
            nativeModuleMethod: `deviceActions.forget/
              DeviceManagementService.cancelConnection`,
            errorContent: err,
          });
        } else {
          // Remove device information from local storage
          SensitiveInfo.deleteItem(storageKeys.DEVICE);
          dispatch(forget());
        }
      });
    };
  },
  getInfo() {
    return (dispatch, getState) => {
      const { device: deviceState } = getState();
      dispatch(getInfoStart());

      // Get latest information if device is connected
      if (deviceState.isConnected) {
        DeviceInformationService.getDeviceInformation((err, results) => {
          if (err) {
            dispatch(getInfoError(err));
            Mixpanel.trackError({
              path: 'app/actions/device',
              nativeModuleMethod: `deviceActions.getInfo/
                DeviceManagementService.getDeviceInformation`,
              errorContent: err,
            });
          } else {
            // Store device information in local storage
            SensitiveInfo.setItem(storageKeys.DEVICE, results);
            dispatch(getInfo(results));
          }
        });
      } else {
        // Get locally stored device information
        SensitiveInfo.getItem(storageKeys.DEVICE)
          .then(device => {
            if (device) {
              // Attempt to connect to locally stored device
              dispatch(deviceActions.connect(device.identifier));
            } else {
              // No locally stored device, set to empty object
              dispatch(getInfo({}));
            }
          });
      }
    };
  },
};

export default deviceActions;
