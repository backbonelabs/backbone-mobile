import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';
import theme from '../../styles/theme';

const { height, width, applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;
const innerMonitorSize = applyWidthDifference(190);
const topStarSize = 96;
const halfModalHeight = 130;
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
  summaryTopView: {
    marginBottom: 0,
  },
  summaryMainContainer: {
    marginTop: fixedResponsiveFontSize(topStarSize / 2),
  },
  summaryTopStarCircle: {
    fontSize: fixedResponsiveFontSize(topStarSize),
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
        top: (height / 2) - applyWidthDifference(halfModalHeight)
        - fixedResponsiveFontSize(summaryTitleFontSize)
        - fixedResponsiveFontSize(topStarSize / 2)
        - theme.statusBarHeight,
      },
      android: {
        top: (height / 2) - applyWidthDifference(halfModalHeight)
        - fixedResponsiveFontSize(summaryTitleFontSize)
        - fixedResponsiveFontSize(topStarSize / 2)
        - applyWidthDifference(28),
      },
    }),
    left: (width / 2) - applyWidthDifference(40),
  },
  topCircleOverlayShort: {
    position: 'absolute',
    ...Platform.select({ // iOS has a different Y-origin point to Android
      ios: {
        top: (height / 2) - applyWidthDifference(halfModalHeight)
        - fixedResponsiveFontSize(topStarSize / 2)
        - theme.statusBarHeight,
      },
      android: {
        top: (height / 2) - applyWidthDifference(halfModalHeight)
        - fixedResponsiveFontSize(topStarSize / 2)
        - applyWidthDifference(28),
      },
    }),
    left: (width / 2) - applyWidthDifference(40),
  },
  summaryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: fixedResponsiveFontSize(summaryTitleFontSize),
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
  summaryDetailIconGoal: {
    fontSize: fixedResponsiveFontSize(22),
    color: 'white',
    paddingLeft: applyWidthDifference(3),
  },
  summaryDetailIconStar: {
    fontSize: fixedResponsiveFontSize(22),
    color: 'white',
    paddingLeft: applyWidthDifference(2),
  },
  summaryDetailIconVertebrae: {
    width: applyWidthDifference(24),
    height: applyWidthDifference(24),
    resizeMode: 'contain',
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
