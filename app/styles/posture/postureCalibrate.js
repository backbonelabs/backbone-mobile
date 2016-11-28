import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  textContainer: {
    flex: 0.18,
    width: '75%',
    justifyContent: 'flex-end',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10 * heightDifference,
    textAlign: 'center',
  },
  imageContainer: {
    flex: 0.60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 131 * widthDifference,
    height: 237 * widthDifference,
    resizeMode: 'contain',
  },
  calibrationCircleContainer: {
    marginTop: 20 * heightDifference,
    width: '44%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calibrationCircle: {
    width: 25 * widthDifference,
    height: 25 * widthDifference,
    borderRadius: 12.5 * widthDifference,
    backgroundColor: '$primaryColor',
    opacity: 0.4,
  },
  actionsContainer: {
    flex: 0.22,
    alignItems: 'center',
  },
  autoStartPreferenceContainer: {
    flexDirection: 'row',
    width: '75%',
    marginTop: 20 * heightDifference,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoStartPreferenceLabel: {
    flex: 0.5,
    alignItems: 'flex-end',
    marginHorizontal: 10 * widthDifference,
  },
  autoStartPreferenceSwitch: {
    flex: 0.5,
    alignItems: 'flex-start',
  },
});
