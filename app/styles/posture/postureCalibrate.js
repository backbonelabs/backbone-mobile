import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference, heightDifference } = relativeDimensions;

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
    width: applyWidthDifference(131),
    height: applyWidthDifference(237),
    resizeMode: 'contain',
  },
  calibrationCircleContainer: {
    marginTop: 20 * heightDifference,
    width: '44%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calibrationCircle: {
    width: applyWidthDifference(25),
    height: applyWidthDifference(25),
    borderRadius: 12.5,
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
    marginHorizontal: applyWidthDifference(10),
  },
  autoStartPreferenceSwitch: {
    flex: 0.5,
    alignItems: 'flex-start',
  },
});
