import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

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
  $settingsIconSize: fixedResponsiveFontSize(24),
  container: {
    width: '100%',
  },
  sensorSettingsContainer: {
    height: applyWidthDifference(100),
    flexDirection: 'row',
    ...bottomBorder,
  },
  sensorIconContainer: {
    flex: 0.35,
    ...absoluteCenter,
  },
  sensorIcon: {
    width: applyWidthDifference(70),
    height: applyWidthDifference(59),
    resizeMode: 'contain',
  },
  sensorTextTitle: {
    marginBottom: applyWidthDifference(2),
  },
  sensorText: {
    flex: 0.45,
    justifyContent: 'center',
  },
  batteryInfo: {
    ...centerRowItems,
  },
  deviceInfoText: {
    marginVertical: applyWidthDifference(2),
    fontSize: fixedResponsiveFontSize(13),
    color: '$primaryFontColor',
  },
  batteryIconGreen: {
    color: '#32CD32',
  },
  batteryIconRed: {
    color: '#FF0000',
  },
  settingsHeader: {
    ...bottomBorder,
    paddingLeft: applyWidthDifference(15),
    paddingTop: applyWidthDifference(15),
    paddingBottom: applyWidthDifference(5),
  },
  settingsRow: {
    height: applyWidthDifference(48),
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
    paddingRight: applyWidthDifference(10),
  },
  arrowIcon: {
    width: applyWidthDifference(12),
    height: applyWidthDifference(23),
    resizeMode: 'contain',
  },
  buttonContainer: {
    marginVertical: applyWidthDifference(40),
    flex: 1,
    ...absoluteCenter,
  },
  devMenu: {
    borderWidth: 1,
    padding: applyWidthDifference(10),
  },
  devMenuItem: {
    marginTop: applyWidthDifference(2),
  },
  spinner: {
    height: applyWidthDifference(25),
  },
});
