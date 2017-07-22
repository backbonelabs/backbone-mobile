import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference, applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  deviceInfoContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 25 * heightDifference,
  },
  button: {
    marginHorizontal: applyWidthDifference(10),
  },
  sensorImage: {
    marginBottom: 10 * heightDifference,
  },
  deviceInfoBodyText: {
    marginVertical: 7.5 * heightDifference,
    color: '$primaryFontColor',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20 * heightDifference,
  },
  deviceConnectionText: {
    fontWeight: 'bold',
    fontSize: fixedResponsiveFontSize(16),
    paddingBottom: applyWidthDifference(25),
  },
  batteryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: applyWidthDifference(5),
  },
  deviceInfo: {
    fontSize: fixedResponsiveFontSize(13),
  },
  deviceInfoText: {
    fontSize: fixedResponsiveFontSize(16),
    color: '#000000',
  },
  batteryInfoText: {
    fontSize: fixedResponsiveFontSize(16),
    color: '#000000',
  },
  batteryInfoTextRed: {
    fontSize: fixedResponsiveFontSize(16),
    color: '#FF0000',
  },
  batteryIconBlack: {
    color: '#000000',
    fontSize: fixedResponsiveFontSize(30),
  },
  batteryIconRed: {
    color: '#FF0000',
    fontSize: fixedResponsiveFontSize(30),
  },
});
