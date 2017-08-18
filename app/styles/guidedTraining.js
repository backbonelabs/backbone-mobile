import { Dimensions, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  $progressBarHeight: applyWidthDifference(20),
  container: {
    alignItems: 'center',
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
  timer: {
    fontSize: fixedResponsiveFontSize(60),
  },
  gif: {
    width: Dimensions.get('window').width * 0.75, // 75% of screen width
    height: Dimensions.get('window').width * 0.75 * 0.9, // same aspect ratio as gifs
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: applyWidthDifference(12),
    width: '100%',
  },
  footerButtonContainer: {
    alignItems: 'center',
    width: '33%',
  },
  footerButton: {
    alignItems: 'center',
    borderRadius: applyWidthDifference(30),
    borderWidth: 1,
    borderColor: 'gray',
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowRadius: 3,
        shadowOpacity: 0.15,
      },
    }),
    justifyContent: 'center',
    height: applyWidthDifference(60),
    width: applyWidthDifference(60),
  },
});
