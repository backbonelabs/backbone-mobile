// Mock react-native
require('react-native-mock/mock');

const RN = require('react-native');

Object.assign(RN.NativeModules, {
  Environment: {
    BUGSNAG_API_KEY: 'ApiKey',
  },
  DeviceManagementService: jest.fn(),
  BluetoothService: {
    getState: jest.fn(),
  },
  NotificationService: jest.fn(),
  SessionControlService: jest.fn(),
  VibrationMotorService: jest.fn(),
  BootLoaderService: jest.fn(),
  UserService: {
    unsetUserId: jest.fn(),
    setUserId: jest.fn(),
  },
  RNFLAnimatedImageManager: {},
});

global.fetch = jest.fn();

// Helper to mock a successful response (only once)
fetch.mockResponseSuccess = (body) => {
  fetch.mockImplementationOnce(
    () => {
      const res = {
        json: () => Promise.resolve(body),
      };
      // password reset res
      if (body.ok) {
        res.ok = body.ok;
      }
      return Promise.resolve(res);
    }
  );
};

// Helper to mock a failure response (only once)
fetch.mockResponseFailure = (error) => {
  fetch.mockImplementationOnce(
    () => Promise.reject(error)
  );
};

jest.mock('./app/utils/SensitiveInfo', () => ({
  deleteItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('./app/utils/Mixpanel', () => ({
  track: jest.fn(),
  identify: jest.fn(),
  set: jest.fn(),
  trackWithProperties: jest.fn(),
  setUserProperties: jest.fn(),
}));

jest.mock('bugsnag-react-native', () => ({
  Client: jest.fn(() => ({
    clearUser: jest.fn(),
    setUser: jest.fn(),
  })),
  Configuration: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
  downloadFile: jest.fn(),
}));
jest.mock('react-native-fbsdk', () => ({
  LoginManager: {
    logOut: jest.fn(),
    logInWithReadPermissions:
      jest.fn(() => new Promise((resolve) => resolve(true))),
  },
  AccessToken: {
    getCurrentAccessToken:
      jest.fn(() => new Promise((resolve) => resolve(true))),
  },
  GraphRequestManager: jest.fn(),
}
));
