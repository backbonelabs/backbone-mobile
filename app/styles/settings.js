import EStyleSheet from 'react-native-extended-stylesheet';

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
  },
  sensorSettingsContainer: Object.assign({ flex: 0.15, flexDirection: 'row' }, border),
  sensorIcon: Object.assign({ flex: 0.35 }, absoluteCenter),
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
    marginRight: 3,
  },
  arrow: Object.assign({ flex: 0.13 }, absoluteCenter),
  arrowIcon: {
    transform: [{ rotate: '180deg' }],
  },
  settingsIcon: {
    flex: 0.15,
    alignItems: 'center',
  },
  settingsText: {
    flex: 0.72,
  },
  accountRemindersContainer: Object.assign({ flex: 0.30 }, border),
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
    flex: 0.2,
    justifyContent: 'center',
  },
  button: {
    alignSelf: 'center',
  },
});
