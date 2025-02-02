import { Platform } from 'react-native';
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
    width: applyWidthDifference(80),
    height: applyWidthDifference(70),
    resizeMode: 'contain',
  },
  sensorTextTitle: {
    marginBottom: applyWidthDifference(2),
    fontWeight: 'bold',
  },
  sensorText: {
    flex: 0.45,
    justifyContent: 'center',
  },
  batteryInfo: {
    ...centerRowItems,
    marginVertical: applyWidthDifference(2),
  },
  deviceConnectionStatus: {
    flexDirection: 'row',
    marginVertical: applyWidthDifference(2),
  },
  green: {
    color: '$infoColor',
  },
  red: {
    color: '$warningColor',
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
  settingsRowEmpty: {
    height: applyWidthDifference(24),
    backgroundColor: '#f1f1f1',
    ...centerRowItems,
    ...bottomBorder,
  },
  settingsText: {
    flex: 0.8,
    paddingLeft: applyWidthDifference(15),
  },
  settingsLeftText: {
    flex: 0.6,
    paddingLeft: applyWidthDifference(15),
  },
  settingsRightText: {
    flex: 0.4,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: applyWidthDifference(16),
  },
  settingsRightIcon: {
    flex: 0.20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: applyWidthDifference(16),
  },
  arrowIcon: {
    width: applyWidthDifference(8),
    height: applyWidthDifference(18),
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
  slouchContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 0.08,
    flexDirection: 'row',
    paddingLeft: applyWidthDifference(15),
    paddingRight: applyWidthDifference(10),
    height: applyWidthDifference(48),
  },
  picker: {
    ...Platform.select({
      android: {
        marginLeft: applyWidthDifference(11),
        marginRight: applyWidthDifference(10),
      },
    }),
  },
});
