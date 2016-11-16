import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  deviceName: {
    color: 'white',
    fontSize: '1.25rem',
  },
  deviceID: {
    marginTop: '0.5rem',
    fontSize: '0.5rem',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  deviceInfoContainer: {
    flex: 0.55,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  deviceInfo: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  deviceInfoBodyText: {
    color: '$primaryFontColor',
  },
  deviceUpdateText: {
    color: '#0000EE',
    marginTop: 5 * (heightDifference * widthDifference),
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25 * (heightDifference * widthDifference),
  },
  buttonWrapper: {
    flex: 1,
  },
});
