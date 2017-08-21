import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;
const totalPointerLength = applyWidthDifference(88);

export default EStyleSheet.create({
  $sliderHeight: applyWidthDifference(30),
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  connectingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectingSpinner: {
    marginBottom: fixedResponsiveFontSize(10),
  },
  connectingText: {
    marginTop: fixedResponsiveFontSize(10),
  },
  timer: {
    textAlign: 'center',
    fontSize: fixedResponsiveFontSize(54),
    color: '$lightBlueColor',
    marginTop: applyWidthDifference(10),
  },
  heading: {
    textAlign: 'center',
    marginBottom: applyWidthDifference(30),
  },
  monitorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: applyWidthDifference(20),
  },
  animatedProgress: {
    justifyContent: 'center',
  },
  innerMonitorContainer: {
    height: applyWidthDifference(190),
    width: applyWidthDifference(190),
    backgroundColor: 'white',
    borderRadius: 100,
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowColor: '$secondaryFontColor',
        shadowRadius: 2,
        shadowOpacity: 0.3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  pointerContainer: {
    width: (totalPointerLength * 2) - applyWidthDifference(8),
  },
  pointer: {
    height: applyWidthDifference(5),
    width: applyWidthDifference(20),
    borderRadius: 20,
    backgroundColor: '$secondaryFontColor',
  },
  leftCircle: {
    width: applyWidthDifference(15),
    height: applyWidthDifference(15),
    borderRadius: 100,
    position: 'absolute',
    ...Platform.select({
      ios: {
        bottom: applyWidthDifference(50),
        left: applyWidthDifference(86),
      },
      // applyWidthDifference wasn't working as expected on Android,
      // not sure if the circles are in the right location in a smaller or bigger device
      android: {
        bottom: 40,
        left: 75,
      },
    }),
  },
  rightCircle: {
    width: applyWidthDifference(15),
    height: applyWidthDifference(15),
    borderRadius: 100,
    position: 'absolute',
    ...Platform.select({
      ios: {
        bottom: applyWidthDifference(50),
        right: applyWidthDifference(86),
      },
      android: {
        bottom: 40,
        right: 75,
      },
    }),
  },
  postureRatingContainer: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  postureRating: {
    fontSize: fixedResponsiveFontSize(42),
    fontWeight: 'bold',
    marginTop: applyWidthDifference(40),
  },
  refreshIcon: {
    textAlign: 'center',
  },
  reCalibrate: {
    fontSize: fixedResponsiveFontSize(12),
    fontWeight: 'bold',
  },
  sliderTitle: {
    textAlign: 'center',
    marginBottom: applyWidthDifference(40),
    fontSize: fixedResponsiveFontSize(12),
  },
  btnContainer: {
    width: '85%',
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-around',
  },
  partialSpinnerContainer: {
    height: applyWidthDifference(25),
  },
});
