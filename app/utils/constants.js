export default {
  storageNamespace: 'backbone',
  storageKeys: {
    ACCESS_TOKEN: 'accessToken',
    USER: 'user',
    DEVICE: 'device',
    CALIBRATION_AUTO_START: 'calibrationAutoStart',
    SESSION_STATE: 'sessionParameters',
  },
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
  firmwareUpdateStates: {
    INVALID_SERVICE: -2,
    INVALID_FILE: -1,
    BEGIN: 0,
    END_SUCCESS: 1,
    END_ERROR: 2,
    PENDING: 3,
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
  /* eslint-disable max-len */
  emailRegex: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
  /* eslint-disable max-len */
};
