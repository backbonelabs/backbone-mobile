jest.mock('NativeModules', () => ({
  Environment: {
    BUGSNAG_API_KEY: 'ApiKey',
  },
  DeviceManagementService: jest.fn(),
  BluetoothService: jest.fn(),
  NotificationService: jest.fn(),
  SessionControlService: jest.fn(),
  VibrationMotorService: jest.fn(),
  BootLoaderService: jest.fn(),
}));

jest.mock('bugsnag-react-native', () => ({
  Client: jest.fn(),
  Configuration: jest.fn(),
}));

jest.mock('Linking', () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
  getInitialURL: jest.fn().mockImplementation(() => new Promise((resolve) => resolve())),
}));

jest.mock('Animated', () => ({
  createAnimatedComponent: jest.fn(),
}));

jest.mock('Keyboard', () => ({
  dismiss: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
  downloadFile: jest.fn(),
}));
