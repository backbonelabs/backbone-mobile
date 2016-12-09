import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  $iconSize: applyWidthDifference(30),
  container: {
    flex: 1,
  },
  progressBarContainer: {
    flex: 0.13,
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
    flex: 0.8,
    flexDirection: 'row',
  },
  exitOnboardingButton: {
    flex: 1,
    paddingHorizontal: applyWidthDifference(10),
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
