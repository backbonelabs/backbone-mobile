import {
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import Fetcher from '../utils/Fetcher';
import constants from '../utils/constants';
import Mixpanel from '../utils/Mixpanel';
import SensitiveInfo from '../utils/SensitiveInfo';

const {
  Environment,
  DeviceManagementService,
  DeviceInformationService,
} = NativeModules;
const { storageKeys } = constants;
const firmwareUrl = `${Environment.API_SERVER_URL}/firmware`;
const deviceManagementServiceEvents = new NativeEventEmitter(DeviceManagementService);

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
          message: status.message,
          path: 'app/actions/device',
          stackTrace: ['setConnectEventListener', 'deviceManagementServiceEvents.addListener'],
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

function checkFirmware(firmwareVersion) {
  // Fetch device firmware details
  return Fetcher.get({ url: firmwareUrl })
    .then(res => res.json()
      .then(body => {
        let updateAvailable = false;
        // Split firmware versions into array for digit-by-digit comparison
        const newFirmware = body.version.split('.');
        const currentFirmware = firmwareVersion.split('.');

        // Check and compare each of the firmware version digits in order
        // Use for loop, since forEach can't be interrupted
        for (let i = 0; i < newFirmware.length; i++) {
          if (parseInt(newFirmware[i], 10) > parseInt(currentFirmware[i], 10)) {
            updateAvailable = true;
            break;
          }
        }

        return updateAvailable;
      })
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
              message: err.message,
              path: 'app/actions/device',
              stackTrace: ['deviceActions.disconnect', 'DeviceManagementService.cancelConnection'],
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
            message: err.message,
            path: 'app/actions/device',
            stackTrace: ['deviceActions.forget', 'DeviceManagementService.cancelConnection'],
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
              message: err.message,
              path: 'app/actions/device',
              stackTrace: ['deviceActions.getInfo', 'DeviceManagementService.getDeviceInformation'],
            });
          } else {
            // If there's new firmware, set updateAvailable to true
            checkFirmware(results.firmwareVersion)
              .then(updateAvailable => {
                // Clone device in order to add updateAvailable property
                const resultsClone = { ...results, updateAvailable };

                // Store device information in local storage
                SensitiveInfo.setItem(storageKeys.DEVICE, resultsClone);
                dispatch(getInfo(resultsClone));
              });
          }
        });
      } else {
        // Get locally stored device information
        SensitiveInfo.getItem(storageKeys.DEVICE)
          .then(device => {
            if (device) {
              checkFirmware(device.firmwareVersion)
                .then(updateAvailable => {
                  // Clone device in order to add updateAvailable property
                  const deviceClone = { ...device, updateAvailable };

                  // Update device store
                  dispatch(getInfo(deviceClone));
                });
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
