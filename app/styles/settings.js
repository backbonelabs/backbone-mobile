import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference } = relativeDimensions;

const bottomBorder = {
  borderBottomWidth: 1,
  borderColor: '#EEEEEE',
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
  $settingsIconSize: 24 * widthDifference,
  $arrowWidth: 12 * widthDifference,
  $arrowHeight: 23 * widthDifference,
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  sensorSettingsContainer: {
    height: 100 * widthDifference,
    flexDirection: 'row',
    ...bottomBorder,
  },
  sensorIconContainer: {
    flex: 0.35,
    ...absoluteCenter,
  },
  sensorIcon: {
    width: 70 * widthDifference,
    height: 59 * widthDifference,
    resizeMode: 'contain',
  },
  sensorTextTitle: {
    marginBottom: 2 * widthDifference,
  },
  sensorText: {
    flex: 0.45,
    justifyContent: 'center',
  },
  batteryInfo: {
    ...centerRowItems,
  },
  deviceInfoText: {
    marginVertical: 2 * widthDifference,
    fontSize: 13,
    color: '$primaryFontColor',
  },
  batteryIcon: {
    width: 24 * widthDifference,
    height: 13 * widthDifference,
    resizeMode: 'contain',
  },
  settingsHeader: {
    ...bottomBorder,
    paddingLeft: 15 * widthDifference,
    paddingTop: 15 * widthDifference,
    paddingBottom: 5 * widthDifference,
  },
  settingsRow: {
    height: 48 * widthDifference,
    ...centerRowItems,
    ...bottomBorder,
  },
  settingsLeftIcon: {
    flex: 0.15,
    ...absoluteCenter,
  },
  settingsText: {
    flex: 0.65,
  },
  settingsRightIcon: {
    flex: 0.20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 10 * widthDifference,
  },
  buttonContainer: {
    flex: 1,
    ...absoluteCenter,
  },
  devMenu: {
    borderWidth: 1,
    padding: 10 * widthDifference,
  },
  devMenuItem: {
    marginTop: 2 * widthDifference,
  },
});
