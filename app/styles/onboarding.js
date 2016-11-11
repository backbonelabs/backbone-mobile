import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: 23 * heightDifference,
  },
  progressBarContainer: {
    flex: 0.15,
    width: '32%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressIcon: {
    backgroundColor: '$primaryColor',
  },
  onboardingFlowContainer: {
    flex: 0.85,
    flexDirection: 'row',
  },
});
