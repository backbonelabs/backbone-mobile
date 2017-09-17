import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import theme from './theme';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, getResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  $progressBarHeight: applyWidthDifference(20),
  container: {
    alignItems: 'center',
    backgroundColor: theme.grey100,
    flex: 1,
    justifyContent: 'space-between',
  },
  progressBarOuter: {
    backgroundColor: 'gray',
    borderRadius: '$progressBarHeight * 0.5',
    height: '$progressBarHeight',
    marginVertical: applyWidthDifference(12),
    width: '90%',
  },
  progressBarInner: {
    backgroundColor: 'blue',
    borderRadius: '$progressBarHeight * 0.5',
    height: '$progressBarHeight',
    width: '100%',
  },
  progressBarStepIndicators: {
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    top: '0 - $progressBarHeight',
  },
  stepIndicator: {
    width: '$progressBarHeight',
    height: '$progressBarHeight',
  },
  strongText: {
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    width: '90%',
  },
  centerText: {
    textAlign: 'center',
  },
  twoSidedText: {
    flexDirection: 'row',
  },
  timer: {
    fontSize: getResponsiveFontSize(40),
  },
  footer: {
    backgroundColor: theme.grey50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: applyWidthDifference(12),
    width: '100%',
  },
  footerButtonContainer: {
    alignItems: 'center',
    width: '33%',
  },
  footerButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: applyWidthDifference(30),
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowRadius: 3,
        shadowOpacity: 0.15,
      },
      android: {
        elevation: 2,
      },
    }),
    height: applyWidthDifference(60),
    justifyContent: 'center',
    width: applyWidthDifference(60),
  },
  footerButtonIconContainer: {
    borderRadius: applyWidthDifference(30),
    overflow: 'hidden',
  },
  footerButtonText: {
    marginTop: applyWidthDifference(8),
    textAlign: 'center',
  },
  helpIcon: {
    color: '$secondaryFontColor',
    fontSize: getResponsiveFontSize(25),
  },
  glossaryContainer: {
    alignItems: 'center',
  },
  glossaryTextContainer: {
    alignItems: 'center',
  },
  glossaryTitleText: {
    textAlign: 'center',
    marginBottom: applyWidthDifference(14),
  },
  glossaryDetailText: {
    textAlign: 'justify',
    marginHorizontal: applyWidthDifference(12),
  },
});
