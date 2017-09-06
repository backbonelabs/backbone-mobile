import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize, width } = relativeDimensions;
const innerMonitorSize = applyWidthDifference(190);

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grey100',
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
    marginTop: applyWidthDifference(10),
    color: '$lightBlue500',
  },
  heading: {
    textAlign: 'center',
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
          height: 0,
        },
        shadowRadius: 4,
        shadowOpacity: 0.15,
      },
      android: {
        elevation: 2,
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
    left: (width * 0.5) - (applyWidthDifference(220 / 2) *
    Math.sin((60 * Math.PI) / 180)) - applyWidthDifference(15 / 8),
  },
  rightCircle: {
    width: applyWidthDifference(15),
    height: applyWidthDifference(15),
    borderRadius: applyWidthDifference(15 / 2),
    position: 'absolute',
    bottom: applyWidthDifference(44),
    right: (width * 0.5) - (applyWidthDifference(220 / 2) *
    Math.sin((60 * Math.PI) / 180)) - applyWidthDifference(15 / 8),
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
  sliderTitle: {
    textAlign: 'center',
    fontSize: fixedResponsiveFontSize(12),
    marginBottom: applyWidthDifference(10),
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
