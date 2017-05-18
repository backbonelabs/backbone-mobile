import {
  NativeModules,
} from 'react-native';
import {
  DEVICE_CONNECT,
  DEVICE_CONNECT_STATUS,
  DEVICE_DISCONNECT,
  DEVICE_FORGET,
  DEVICE_GET_INFO,
  DEVICE_SELF_TEST__START,
  DEVICE_SELF_TEST__END,
  DEVICE_RESTORE_SAVED_SESSION,
  DEVICE_CLEAR_SAVED_SESSION,
} from './types';
import store from '../store';
import Fetcher from '../utils/Fetcher';
import constants from '../utils/constants';
import Mixpanel from '../utils/Mixpanel';
import SensitiveInfo from '../utils/SensitiveInfo';

const {
  Environment,
  BluetoothService,
  DeviceManagementService,
  DeviceInformationService,
} = NativeModules;
const { bluetoothStates, storageKeys } = constants;
const baseFirmwareUrl = `${Environment.API_SERVER_URL}/firmware`;

function checkFirmware(firmwareVersion) {
  // major software version is Y in W.X.Y.Z
  const currentFirmware = firmwareVersion.split('.');
  const majorSoftwareVersion = currentFirmware[2];
  const firmwareUrl = `${baseFirmwareUrl}/v${majorSoftwareVersion}`;

  // Fetch device firmware details
  return Fetcher.get({ url: firmwareUrl })
    .then(res => res.json())
    .then(body => {
      let updateAvailable = false;
      // Split firmware versions into array for digit-by-digit comparison
      const newFirmware = body.version.split('.');

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
    .catch(() => false);
}

const deviceActions = {
  connect(identifier) {
    return {
      type: DEVICE_CONNECT,
      payload: () => new Promise((resolve, reject) => {
        BluetoothService.getState((err, { state }) => {
          if (err || state !== bluetoothStates.ON) {
            reject(new Error((err && err.message) || 'Bluetooth is not enabled.'));
          } else {
            Mixpanel.trackWithProperties('connectToDevice', {
              deviceIdentifier: identifier,
            });

            // Connect to device with specified identifier
            DeviceManagementService.connectToDevice(identifier);
            resolve();
          }
        });
      }),
    };
  },
  connectStatus(status) {
    return {
      type: DEVICE_CONNECT_STATUS,
      payload: () => new Promise((resolve, reject) => {
        if (status.message) {
          reject(new Error(status.message));
        }
        resolve(status);
      }),
    };
  },
  didDisconnect() {
    return { type: DEVICE_DISCONNECT };
  },
  disconnect() {
    return {
      type: DEVICE_DISCONNECT,
      payload: () => {
        // Attempt disconnect only if device is connected
        if (store.getState().device.isConnected) {
          return new Promise((resolve, reject) => {
            DeviceManagementService.cancelConnection(err => {
              if (err) {
                Mixpanel.trackError({
                  errorContent: err,
                  path: 'app/actions/device',
                  stackTrace: [
                    'deviceActions.disconnect',
                    'DeviceManagementService.cancelConnection',
                  ],
                });
                reject(new Error(err.message));
              } else {
                Mixpanel.unregisterSuperProperty('firmwareVersion');
                resolve();
              }
            });
          });
        }
        return;
      },
    };
  },
  forget() {
    return {
      type: DEVICE_FORGET,
      payload: () => new Promise((resolve, reject) => {
        Mixpanel.track('forgetDevice');
        // Disconnect device before attempting to forget
        DeviceManagementService.cancelConnection(err => {
          if (err) {
            Mixpanel.trackError({
              errorContent: err,
              path: 'app/actions/device',
              stackTrace: ['deviceActions.forget', 'DeviceManagementService.cancelConnection'],
            });
            reject(new Error(err.message));
          } else {
            Mixpanel.unregisterSuperProperty('firmwareVersion');

            // Remove device information from local storage
            SensitiveInfo.deleteItem(storageKeys.DEVICE);
            resolve();
          }
        });
      }),
    };
  },
  getInfo() {
    const { device: deviceState } = store.getState();
    return {
      type: DEVICE_GET_INFO,
      payload: () => new Promise((resolve, reject) => {
        // Get latest information if device is connected
        if (deviceState.isConnected) {
          DeviceInformationService.getDeviceInformation((err, results) => {
            if (err) {
              // Remove firmwareVersion property from the super property when not connected
              Mixpanel.unregisterSuperProperty('firmwareVersion');

              Mixpanel.trackError({
                errorContent: err,
                path: 'app/actions/device',
                stackTrace: [
                  'deviceActions.getInfo',
                  'DeviceManagementService.getDeviceInformation',
                ],
              });
              reject(new Error(err.message));
            } else if (results.batteryLevel === -1) {
              // Fail-safe to fetch the last device information.
              // This is needed on bootloader failure, so that the app will still recognize
              // that there's a saved device instead of treating the app as having
              // no saved device (whenever available).
              SensitiveInfo.getItem(storageKeys.DEVICE)
                .then(device => {
                  if (device) {
                    Mixpanel.registerSuperProperties({ firmwareVersion: results.firmwareVersion });

                    checkFirmware(device.firmwareVersion)
                      .then(updateAvailable => {
                        // Clone device in order to add updateAvailable property
                        const deviceClone = { ...device, updateAvailable };

                        // Update device store
                        resolve(deviceClone);
                      });
                  } else {
                    // No locally stored device, set to empty object
                    resolve({});
                  }
                });
            } else {
              // Register firmwareVersion property upon connected
              Mixpanel.registerSuperProperties({ firmwareVersion: results.firmwareVersion });

              // Send battery reading to Mixpanel
              Mixpanel.trackWithProperties('batteryReading', {
                percentage: results.batteryLevel,
              });

              // If there's new firmware, set updateAvailable to true
              checkFirmware(results.firmwareVersion)
                .then(updateAvailable => {
                  // Clone device in order to add updateAvailable property
                  const resultsClone = { ...results, updateAvailable };

                  // Store device information in local storage
                  SensitiveInfo.setItem(storageKeys.DEVICE, resultsClone);
                  resolve(resultsClone);
                });
            }
          });
        } else {
          // Device is not connected, get locally stored device information
          SensitiveInfo.getItem(storageKeys.DEVICE)
            .then(device => {
              if (device) {
                Mixpanel.registerSuperProperties({ firmwareVersion: device.firmwareVersion });

                checkFirmware(device.firmwareVersion)
                  .then(updateAvailable => {
                    // Clone device in order to add updateAvailable property
                    const deviceClone = { ...device, updateAvailable };

                    // Update device store
                    resolve(deviceClone);
                  });

                // Attempt to connect to locally stored device
                store.dispatch(deviceActions.connect(device.identifier));
              } else {
                // No locally stored device, set to empty object
                resolve({});
              }
            });
        }
      }),
    };
  },
  selfTestStarted() {
    return { type: DEVICE_SELF_TEST__START };
  },
  selfTestEnded(status) {
    return {
      type: DEVICE_SELF_TEST__END,
      payload: status,
    };
  },
  restoreSavedSession() {
    return { type: DEVICE_RESTORE_SAVED_SESSION };
  },
  clearSavedSession() {
    return { type: DEVICE_CLEAR_SAVED_SESSION };
  },
};

export default deviceActions;
