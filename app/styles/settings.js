import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;


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
  $settingsIconSize: applyWidthDifference(24),
  $arrowWidth: applyWidthDifference(12),
  $arrowHeight: applyWidthDifference(23),
  backgroundImage: {
    width: '100%',
    height: '100%',
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
    fontSize: applyWidthDifference(13),
    color: '$primaryFontColor',
  },
  batteryIcon: {
    width: applyWidthDifference(24),
    height: applyWidthDifference(13),
    resizeMode: 'contain',
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
  buttonContainer: {
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
});
