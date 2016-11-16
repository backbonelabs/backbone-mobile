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
  heightUnitIdToLabel: {
    1: 'IN',
    2: 'CM',
  },
  weightUnitIdToLabel: {
    1: 'LB',
    2: 'KG',
  },
  gender: {
    male: 1,
    female: 2,
  },
  height: {
    defaults: {
      value: 60,
      unit: 1,
    },
    units: {
      IN: 1,
      CM: 2,
    },
    conversionValue: 2.54,
  },
  weight: {
    defaults: {
      value: 100,
      unit: 1,
    },
    units: {
      LB: 1,
      KG: 2,
    },
    conversionValue: 0.453592,
  },
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};
