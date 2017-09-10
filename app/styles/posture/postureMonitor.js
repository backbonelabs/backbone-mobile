import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import color from 'color';
import relativeDimensions from '../../utils/relativeDimensions';

const {
  width,
  applyWidthDifference,
  getResponsiveFontSize,
  fixedResponsiveFontSize,
} = relativeDimensions;
const innerMonitorSize = applyWidthDifference(190);
const summaryStarHeight = 70;
const summaryStarCircleHeight = summaryStarHeight * 1.5;
const summaryTitleFontSize = 24;

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
    marginBottom: applyWidthDifference(10),
  },
  connectingText: {
    marginTop: applyWidthDifference(10),
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
  summaryTopView: {
    paddingVertical: 0,
  },
  summaryTopIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTopCircle: {
    fontSize: fixedResponsiveFontSize(summaryStarCircleHeight),
    color: '$lightBlue500',
  },
  summaryTopStar: {
    fontSize: fixedResponsiveFontSize(summaryStarHeight),
    backgroundColor: 'transparent',
    color: 'white',
    position: 'absolute',
  },
  summaryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: getResponsiveFontSize(summaryTitleFontSize),
    fontWeight: 'bold',
    marginBottom: applyWidthDifference(12),
    color: '$lightBlue500',
  },
  emptyTitle: {
    height: getResponsiveFontSize(summaryTitleFontSize),
  },
  summaryDetailContainer: {
    alignItems: 'center',
    width: applyWidthDifference(270),
    borderRadius: applyWidthDifference(10),
    backgroundColor: () => (
      color(EStyleSheet.value('$lightBlue500')).clearer(0.5).rgbString()
    ),
  },
  summaryDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: applyWidthDifference(10),
  },
  summaryDetailIconContainer: {
    flex: 0.1,
    alignItems: 'center',
  },
  summaryDetailIconGoal: {
    fontSize: applyWidthDifference(24),
    color: 'white',
  },
  summaryDetailIconStar: {
    fontSize: applyWidthDifference(24),
    color: 'white',
  },
  summaryDetailIconVertebrae: {
    width: applyWidthDifference(24),
    height: applyWidthDifference(24),
    resizeMode: 'contain',
  },
  summaryDetailCaptionContainer: {
    flex: 0.6,
    paddingLeft: applyWidthDifference(8),
  },
  summaryDetailValueContainer: {
    flex: 0.3,
    alignItems: 'flex-end',
  },
  summaryDetailValue: {
    fontWeight: 'bold',
  },
  summaryDetailLine: {
    borderBottomWidth: 1,
    width: applyWidthDifference(260),
    borderBottomColor: 'white',
    marginLeft: applyWidthDifference(15),
  },
});
