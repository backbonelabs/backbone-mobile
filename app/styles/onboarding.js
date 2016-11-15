import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  progressBarContainer: {
    flex: 0.1,
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
    flex: 0.77,
    flexDirection: 'row',
  },
  exitOnboarding: {
    flex: 0.07,
    paddingRight: 15,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
