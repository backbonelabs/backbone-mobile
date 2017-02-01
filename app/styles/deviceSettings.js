import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  deviceInfoContainer: {
    flex: 0.55,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sensorImage: {
    marginBottom: 25 * heightDifference,
  },
  deviceInfoBodyText: {
    marginVertical: 7.5 * heightDifference,
    color: '$primaryFontColor',
  },
  buttonContainer: {
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 25 * heightDifference,
  },
  updateButton: {
    marginTop: 10 * heightDifference,
  },
});
