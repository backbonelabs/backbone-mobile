import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

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
    fontSize: fixedResponsiveFontSize(16),
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
  deviceInfoText: {
    fontSize: fixedResponsiveFontSize(14),
    color: '#000000',
  },
  firmwareUpdateInfoText: {
    fontSize: fixedResponsiveFontSize(16),
    marginHorizontal: applyWidthDifference(10),
    textAlign: 'center',
    color: '#000000',
  },
  firmwareUpdateProgressTextBlack: {
    fontSize: fixedResponsiveFontSize(16),
    color: '#000000',
  },
  firmwareUpdateProgressTextGreen: {
    fontSize: fixedResponsiveFontSize(16),
    color: '#32CD32',
  },
  firmwareUpdateProgressTextRed: {
    fontSize: fixedResponsiveFontSize(16),
    color: '#FF0000',
  },
  batteryInfoTextBlack: {
    fontSize: fixedResponsiveFontSize(16),
    color: '#000000',
  },
  batteryInfoTextRed: {
    fontSize: fixedResponsiveFontSize(16),
    color: '#FF0000',
  },
  batteryIconBlack: {
    color: '#000000',
    fontSize: fixedResponsiveFontSize(25),
  },
  batteryIconRed: {
    color: '#FF0000',
    fontSize: fixedResponsiveFontSize(25),
  },
});
