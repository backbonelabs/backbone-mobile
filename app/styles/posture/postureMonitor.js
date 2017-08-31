import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { height, width, applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;
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
    marginBottom: 0,
  },
  summaryMainContainer: {
    marginTop: applyWidthDifference(40),
  },
  summaryTopStarCircle: {
    fontSize: fixedResponsiveFontSize(96),
  },
  summaryTopStar: {
    fontSize: fixedResponsiveFontSize(60),
    color: 'white',
    position: 'absolute',
    top: applyWidthDifference(18),
    left: applyWidthDifference(13),
  },
  topCircleOverlay: {
    position: 'absolute',
    ...Platform.select({ // iOS has a different Y-origin point to Android
      ios: {
        top: (height / 2) - applyWidthDifference(225),
      },
      android: {
        top: (height / 2) - applyWidthDifference(240),
      },
    }),
    left: (width / 2) - applyWidthDifference(40),
  },
  topCircleOverlayShort: {
    position: 'absolute',
    ...Platform.select({ // iOS has a different Y-origin point to Android
      ios: {
        top: (height / 2) - applyWidthDifference(200),
      },
      android: {
        top: (height / 2) - applyWidthDifference(215),
      },
    }),
    left: (width / 2) - applyWidthDifference(40),
  },
  summaryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: fixedResponsiveFontSize(24),
    fontWeight: 'bold',
    paddingTop: applyWidthDifference(20),
    paddingBottom: applyWidthDifference(35),
  },
  emptyTitle: {
    paddingBottom: applyWidthDifference(35),
  },
  summaryDetailContainer: {
    alignItems: 'center',
    width: applyWidthDifference(270),
    borderRadius: applyWidthDifference(10),
  },
  summaryDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: applyWidthDifference(15),
  },
  summaryDetailIconContainer: {
    flex: 0.1,
    paddingRight: applyWidthDifference(8),
  },
  summaryDetailIcon: {
    fontSize: fixedResponsiveFontSize(22),
    color: 'white',
    paddingLeft: applyWidthDifference(3),
  },
  summaryDetailCaptionContainer: {
    flex: 0.6,
    alignItems: 'flex-start',
  },
  summaryDetailCaption: {
    fontSize: fixedResponsiveFontSize(15),
  },
  summaryDetailValueContainer: {
    flex: 0.3,
    alignItems: 'flex-end',
  },
  summaryDetailValue: {
    fontWeight: 'bold',
    fontSize: fixedResponsiveFontSize(15),
  },
  summaryDetailLine: {
    borderBottomWidth: 1,
    width: applyWidthDifference(260),
    borderBottomColor: 'white',
    marginLeft: applyWidthDifference(15),
  },
});
