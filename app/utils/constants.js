export default {
  storageNamespace: 'backbone',
  accessTokenStorageKey: 'accessToken',
  userStorageKey: 'user',
  bluetoothStates: {
    UNKNOWN: -1,
    UNSUPPORTED: 0,
    RESETTING: 1,
    OFF: 2,
    TURNING_ON: 3,
    ON: 4,
    DISCONNECTED: 5,
    CONNECTING: 6,
    CONNECTED: 7,
    DISCONNECTING: 8,
    TURNING_OFF: 9,
  },
  deviceStatuses: {
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    DISCONNECTING: 3,
  },
  gender: {
    male: 1,
    female: 2,
  },
  height: {
    conversionTypes: ['in', 'cm'],
    conversionValue: 2.54,
  },
  weight: {
    conversionTypes: ['lb', 'kg'],
    conversionValue: 0.453592,
  },
};
