import {
  NativeModules,
  NativeAppEventEmitter,
} from 'react-native';

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

const scanStart = () => ({ type: 'SCAN__START' });

const scan = payload => ({
  type: 'SCAN',
  payload,
});

const scanError = error => ({
  type: 'SCAN__ERROR',
  error,
});

const forgetStart = () => ({ type: 'FORGET__START' });

const forget = payload => ({
  type: 'FORGET',
  payload,
});

const forgetError = payload => ({
  type: 'FORGET__ERROR',
  payload,
});

async function ConnectEventListener(dispatch) {
  let eventListener = await NativeAppEventEmitter.once('ConnectionStatus', status => {
    dispatch(connect(status));
  });

  return eventListener;
}

async function ScanEventListener(dispatch) {
  let eventListener = await NativeAppEventEmitter.once('DevicesFound', deviceList => {
    dispatch(scan(deviceList));
  });

  return eventListener;
}

export default {
  connect() {
    return (dispatch) => {
      dispatch(connectStart());

      return ConnectEventListener(dispatch)
        .then(() => DeviceManagementService.connectToDevice());
    };
  },
  scan() {
    return (dispatch) => {
      dispatch(scanStart());

      return ScanEventListener(dispatch)
        .then(() => DeviceManagementService.scanForDevices());
    };
  },
  forget() {
    return (dispatch) => {
      dispatch(forgetStart());

      return DeviceManagementService.forgetDevice()
        .then(() => dispatch(forget()))
        .catch((error) => dispatch(forgetError(error)));
    };
  },
};
