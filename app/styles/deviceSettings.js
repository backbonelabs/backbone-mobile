import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, getResponsiveFontSize, noScale } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  deviceInfoContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: applyWidthDifference(25),
  },
  button: {
    marginHorizontal: applyWidthDifference(10),
  },
  deviceStatusImage: {
    marginBottom: applyWidthDifference(10),
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: applyWidthDifference(20),
  },
  deviceConnectionText: {
    fontWeight: 'bold',
    paddingBottom: applyWidthDifference(22),
  },
  batteryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: applyWidthDifference(8),
  },
  deviceStatus: {
    paddingBottom: applyWidthDifference(8),
  },
  deviceInfo: {
    alignItems: 'center',
  },
  firmwareUpdateInfoText: {
    marginHorizontal: applyWidthDifference(10),
    textAlign: 'center',
  },
  green: {
    color: '$infoColor',
  },
  red: {
    color: '$warningColor',
  },
  batteryIconBlack: {
    color: '$primaryFontColor',
    fontSize: noScale(getResponsiveFontSize(25)),
  },
  batteryIconRed: {
    color: '$warningColor',
    fontSize: noScale(getResponsiveFontSize(25)),
  },
});
