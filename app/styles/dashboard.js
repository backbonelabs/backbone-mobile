import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

const hexagonConnectorDefaults = {
  position: 'absolute',
  backgroundColor: 'white',
  width: applyWidthDifference(6),
};

const largeHexagonHeight = 100;
const smallHexagonHeight = 70;

export default EStyleSheet.create({
  $hexagonContainerHeight: applyWidthDifference(largeHexagonHeight),
  $hexagonContainerEndHeight:
    applyWidthDifference(largeHexagonHeight) - applyWidthDifference(smallHexagonHeight),
  $carouselSliderWidth: '100%',
  $carouselItemWidth: '85%',
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
    height: '$hexagonContainerEndHeight',
    top: '$hexagonContainerHeight - $hexagonContainerEndHeight',
  },
  hexagonConnector: {
    ...hexagonConnectorDefaults,
    height: '$hexagonContainerHeight',
  },
  hexagon: {
    width: applyWidthDifference(92),
    height: applyWidthDifference(102),
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});
