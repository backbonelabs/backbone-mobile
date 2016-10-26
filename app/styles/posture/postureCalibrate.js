import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const { width, height } = Dimensions.get('window');
const widthDifference = width / 375;
const heightDifference = height / 667;

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer: {
    flex: 0.33,
    width: '75%',
    alignSelf: 'center',
  },
  headingText: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  secondaryText: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calibrationCircleContainer: {
    flex: 0.2,
    width: '44%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calibrationCircle: {
    width: 25 * widthDifference,
    height: 25 * heightDifference,
    borderRadius: 12.5,
    backgroundColor: '$primaryColor',
  },
  imageContainer: {
    flex: 0.47,
    alignItems: 'center',
  },
  image: {
    width: 133 * widthDifference,
    height: 280 * heightDifference,
  },
});
