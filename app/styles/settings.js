import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const settingsHeader = {
  justifyContent: 'flex-end',
  borderBottomWidth: 1,
  borderColor: '#EEEEEE',
  paddingLeft: 15,
  paddingBottom: 5,
};

const border = {
  borderBottomWidth: 1,
  borderColor: '#EEEEEE',
};

const positioning = {
  flexDirection: 'row',
  alignItems: 'center',
};

const absoluteCenter = {
  alignItems: 'center',
  justifyContent: 'center',
};

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: 375 * relativeDimensions.widthDifference,
    height: 667 * relativeDimensions.heightDifference,
  },
  sensorSettingsContainer: Object.assign({ flex: 0.18, flexDirection: 'row' }, border),
  sensorIconContainer: Object.assign({ flex: 0.35 }, absoluteCenter),
  sensorIcon: {
    width: 70 * relativeDimensions.widthDifference,
    height: 59 * relativeDimensions.heightDifference,
    resizeMode: 'contain',
  },
  sensorText: {
    flex: 0.52,
    justifyContent: 'center',
  },
  batteryInfo: Object.assign({ marginVertical: 3 }, positioning),
  batteryText: {
    fontSize: 13,
    color: 'black',
  },
  batteryIcon: {
    width: 24 * relativeDimensions.widthDifference,
    height: 13 * relativeDimensions.heightDifference,
    marginRight: 3 * relativeDimensions.widthDifference,
    resizeMode: 'contain',
  },
  arrow: Object.assign({ flex: 0.13 }, absoluteCenter),
  settingsIcon: {
    flex: 0.15,
    alignItems: 'center',
  },
  settingsText: {
    flex: 0.72,
  },
  accountRemindersContainer: Object.assign({ flex: 0.32 }, border),
  accountRemindersHeader: Object.assign({ flex: 0.25 }, settingsHeader),
  accountRemindersSettingContainer: Object.assign({ flex: 0.25 }, positioning, border),
  helpContainer: {
    flex: 0.23,
  },
  notificationsContainer: Object.assign({ flex: 0.26 }, positioning),
  notificationsText: {
    flex: 0.65,
  },
  notificationsSwitch: {
    flex: 0.2,
    alignItems: 'center',
  },
  helpSettingsHeader: Object.assign({ flex: 0.33 }, settingsHeader),
  helpSettingContainer: Object.assign({ flex: 0.34 }, positioning, border),
  buttonContainer: {
    flex: 0.27,
    justifyContent: 'center',
  },
  button: {
    alignSelf: 'center',
  },
});
