import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference, widthDifference } = relativeDimensions;

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
  exitOnboardingButton: {
    paddingHorizontal: 10 * (widthDifference * heightDifference),
    justifyContent: 'center',
  },
  exitOnboardingIcon: {
    flex: 0.07,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  exitOnboardingIconColor: {
    backgroundColor: '$secondaryFontColor',
  },
});
