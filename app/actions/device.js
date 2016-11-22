import { NativeModules, NativeAppEventEmitter } from 'react-native';

const { DeviceManagementService, DeviceInformationService } = NativeModules;

const connectStart = () => ({ type: 'DEVICE_CONNECT__START' });

const connect = payload => ({
  type: 'DEVICE_CONNECT',
  payload,
});

const connectError = payload => ({
  type: 'DEVICE_CONNECT__ERROR',
  payload,
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

const getInfoStart = () => ({ type: 'DEVICE_GET_INFO__START' });

const getInfo = payload => ({
  type: 'DEVICE_GET_INFO',
  payload,
});

export default {
  connect() {
    return (dispatch) => {
      dispatch(connectStart());
      setConnectEventListener(dispatch);
      DeviceManagementService.connectToDevice();
    };
  },
  getInfo() {
    return (dispatch) => {
      dispatch(getInfoStart());
      DeviceInformationService.getDeviceInfo(results => {
        dispatch(getInfo(results));
      });
    };
  },
};
