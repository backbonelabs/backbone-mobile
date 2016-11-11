import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

const bottomBorder = {
  borderBottomWidth: 1,
  borderColor: '#EEEEEE',
};

const settingsHeader = {
  justifyContent: 'flex-end',
  ...bottomBorder,
  paddingLeft: 15 * widthDifference,
  paddingBottom: 5 * heightDifference,
};

const centerRowItems = {
  flexDirection: 'row',
  alignItems: 'center',
};

const absoluteCenter = {
  alignItems: 'center',
  justifyContent: 'center',
};

export default EStyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  sensorSettingsContainer: {
    flex: 0.18,
    flexDirection: 'row',
    ...bottomBorder,
  },
  sensorIconContainer: {
    flex: 0.35,
    ...absoluteCenter,
  },
  sensorIcon: {
    width: 70 * widthDifference,
    height: 59 * heightDifference,
    resizeMode: 'contain',
  },
  sensorText: {
    flex: 0.52,
    justifyContent: 'center',
  },
  batteryInfo: {
    marginVertical: 3 * heightDifference,
    ...centerRowItems,
  },
  batteryText: {
    fontSize: 13,
    color: '$primaryFontColor',
  },
  batteryIcon: {
    width: 24 * widthDifference,
    height: 13 * heightDifference,
    marginRight: 3 * widthDifference,
    resizeMode: 'contain',
  },
  arrow: {
    flex: 0.13,
    ...absoluteCenter,
  },
  settingsIcon: {
    flex: 0.15,
    alignItems: 'center',
  },
  settingsText: {
    flex: 0.72,
  },
  accountRemindersContainer: {
    flex: 0.32,
    ...bottomBorder,
  },
  accountRemindersHeader: {
    flex: 0.25,
    ...settingsHeader,
  },
  accountRemindersSettingContainer: {
    flex: 0.25,
    ...centerRowItems,
    ...bottomBorder,
  },
  helpContainer: {
    flex: 0.23,
  },
  notificationsContainer: {
    flex: 0.26,
    ...centerRowItems,
  },
  notificationsText: {
    flex: 0.65,
  },
  notificationsSwitch: {
    flex: 0.2,
    alignItems: 'center',
  },
  helpSettingsHeader: {
    flex: 0.33,
    ...settingsHeader,
  },
  helpSettingContainer: {
    flex: 0.34,
    ...centerRowItems,
    ...bottomBorder,
  },
  buttonContainer: {
    flex: 0.27,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
