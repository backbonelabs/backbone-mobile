import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;
const innerMonitorSize = applyWidthDifference(190);

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'space-around',
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
    marginTop: applyWidthDifference(-30),
  },
  monitorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedProgress: {
    justifyContent: 'center',
  },
  innerMonitorContainer: {
    height: innerMonitorSize,
    width: innerMonitorSize,
    backgroundColor: 'white',
    borderRadius: innerMonitorSize / 2,
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
    width: innerMonitorSize - applyWidthDifference(20),
  },
  pointer: {
    height: applyWidthDifference(5),
    width: applyWidthDifference(20),
    borderRadius: applyWidthDifference(20),
    backgroundColor: '$secondaryFontColor',
  },
  leftCircle: {
    width: applyWidthDifference(15),
    height: applyWidthDifference(15),
    borderRadius: applyWidthDifference(15 / 2),
    position: 'absolute',
    bottom: applyWidthDifference(44),
    left: '24%',
  },
  rightCircle: {
    width: applyWidthDifference(15),
    height: applyWidthDifference(15),
    borderRadius: applyWidthDifference(15 / 2),
    position: 'absolute',
    bottom: applyWidthDifference(44),
    right: '24%',
  },
  postureRatingContainer: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  postureRating: {
    fontSize: fixedResponsiveFontSize(42),
    fontWeight: 'bold',
    // ************ styles for recalibration button ************
    // marginTop: applyWidthDifference(40),
  },
  // refreshIcon: {
  //   textAlign: 'center',
  // },
  // reCalibrate: {
  //   fontSize: fixedResponsiveFontSize(12),
  //   fontWeight: 'bold',
  // },
  slider: {
    height: applyWidthDifference(30),
  },
  sliderTitle: {
    textAlign: 'center',
    marginBottom: applyWidthDifference(10),
    marginTop: applyWidthDifference(-30),
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
