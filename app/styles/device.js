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
  deviceInfoBodyText: {
    margin: 20 * (heightDifference * widthDifference),
    color: '$primaryFontColor',
  },
  deviceInfoSecondaryText: {
    marginTop: 5 * (heightDifference * widthDifference),
    color: '$primaryFontColor',
  },
  deviceUpdateText: {
    color: '#0000EE',
    marginTop: 5 * (heightDifference * widthDifference),
    textDecorationLine: 'underline',
    color: '$primaryFontColor',
  },
  batteryIcon: {
    margin: 7 * (heightDifference * widthDifference),
  },
  batteryText: {
    marginLeft: 5,
    color: '$primaryFontColor',
  },
});
