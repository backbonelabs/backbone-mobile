import { Dimensions, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import theme from './theme';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

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
  },
  subheading: {
    fontSize: fixedResponsiveFontSize(16),
    textAlign: 'center',
  },
  instructions: {
    fontSize: fixedResponsiveFontSize(16),
    textAlign: 'center',
  },
  twoSidedText: {
    flexDirection: 'row',
  },
  timer: {
    fontSize: fixedResponsiveFontSize(60),
  },
  gif: {
    width: Dimensions.get('window').width * 0.75, // 75% of screen width
    height: Dimensions.get('window').width * 0.75 * 0.9, // same aspect ratio as gifs
  },
  videoLink: {
    bottom: applyWidthDifference(10),
    position: 'absolute',
    right: applyWidthDifference(10),
  },
  videoIcon: {
    height: applyWidthDifference(23),
    width: applyWidthDifference(23),
  },
  videoPlayerContainer: {
    flex: 2,
  },
  videoPlayer: {
    width: '100%',
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
          height: 0,
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
});
