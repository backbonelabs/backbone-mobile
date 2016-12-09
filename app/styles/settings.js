import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, heightDifference } = relativeDimensions;

const bottomBorder = {
  borderBottomWidth: 1,
  borderColor: '#EEEEEE',
};

const settingsHeader = {
  justifyContent: 'flex-end',
  ...bottomBorder,
  paddingLeft: applyWidthDifference(15),
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
    width: applyWidthDifference(70),
    height: 59 * heightDifference,
    resizeMode: 'contain',
  },
  sensorTextTitle: {
    marginBottom: 2 * heightDifference,
  },
  sensorText: {
    flex: 0.52,
    justifyContent: 'center',
  },
  batteryInfo: {
    ...centerRowItems,
  },
  deviceInfoText: {
    marginVertical: 2 * heightDifference,
    fontSize: applyWidthDifference(13),
    color: '$primaryFontColor',
  },
  batteryIcon: {
    width: applyWidthDifference(24),
    height: 13 * heightDifference,
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
  devMenu: {
    borderWidth: 1,
    padding: applyWidthDifference(10),
  },
  devMenuItem: {
    marginTop: 2 * heightDifference,
  },
});
