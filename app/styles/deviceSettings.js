import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference } = relativeDimensions;

export default EStyleSheet.create({
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
    alignItems: 'center',
  },
  deviceInfoBodyText: {
    marginTop: 5 * heightDifference,
    color: '$primaryFontColor',
  },
  buttonContainer: {
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
