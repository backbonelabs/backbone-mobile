import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';
import theme from '../styles/theme';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

const hexagonConnectorDefaults = {
  position: 'absolute',
  backgroundColor: 'white',
  width: applyWidthDifference(6),
};

const largeHexagonHeight = 100;

export default EStyleSheet.create({
  $errorIconSize: applyWidthDifference(100),
  $hexagonContainerHeight: applyWidthDifference(largeHexagonHeight),
  $carouselSliderWidth: '100%',
  $carouselItemWidth: '85%',
  errorIcon: {
    color: theme.warningColor,
  },
  backgroundImage: {
    flex: 1,
    width: undefined,
    height: undefined,
    alignItems: 'center',
    resizeMode: 'cover',
  },
  levelSliderOuterContainer: {
    height: '50%',
    width: '100%',
  },
  levelSliderInnerContainer: {
    alignItems: 'center',
    paddingTop: '50% - $hexagonContainerHeight',
  },
  hexagonContainer: {
    height: '$hexagonContainerHeight',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagonConnectorTop: {
    ...hexagonConnectorDefaults,
    height: '$hexagonContainerHeight * 0.5',
    top: '$hexagonContainerHeight * 0.51', // extra 0.01 to remove small gap on low density screens
  },
  hexagonConnector: {
    ...hexagonConnectorDefaults,
    height: '$hexagonContainerHeight',
  },
  hexagonCircleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hexagonCircle: {
    fontSize: fixedResponsiveFontSize(9),
    paddingHorizontal: applyWidthDifference(3),
    color: theme.grey300,
  },
  hexagonCircleCompleted: {
    fontSize: fixedResponsiveFontSize(9),
    paddingHorizontal: applyWidthDifference(3),
    color: 'black',
  },
  hexagonCheckmark: {
    fontSize: fixedResponsiveFontSize(22),
    color: 'black',
  },
  hexagon: {
    width: applyWidthDifference(92),
    height: applyWidthDifference(largeHexagonHeight),
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedCard: {
    alignItems: 'center',
  },
  levelLock: {
    fontSize: fixedResponsiveFontSize(30),
    color: theme.grey300,
  },
  sessionLock: {
    fontSize: fixedResponsiveFontSize(40),
    color: theme.grey300,
  },
  carouselContainer: {
    position: 'absolute',
    top: '50% + 10',
    width: '100%',
  },
  verticalDivider: {
    backgroundColor: 'white',
    height: '50%',
    width: applyWidthDifference(6),
  },
  sessionCard: {
    width: '$carouselItemWidth',
  },
  sessionWorkoutRow: {
    flexDirection: 'row',
  },
  workoutBullet: {
    alignSelf: 'center',
    marginRight: applyWidthDifference(8),
    width: applyWidthDifference(10),
    height: applyWidthDifference(10),
  },
});
