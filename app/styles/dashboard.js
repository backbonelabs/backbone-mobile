import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

const hexagonConnectorDefaults = {
  position: 'absolute',
  backgroundColor: 'white',
  width: applyWidthDifference(6),
};

const largeHexagonHeight = 100;
const smallHexagonHeight = 66;

export default EStyleSheet.create({
  $hexagonContainerHeight: applyWidthDifference(largeHexagonHeight),
  $hexagonContainerEndHeight:
    applyWidthDifference(largeHexagonHeight) - applyWidthDifference(smallHexagonHeight),
  backgroundImage: {
    flex: 1,
    width: '100%',
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
  hexagonSm: {
    width: applyWidthDifference(58),
    height: applyWidthDifference(66),
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexagonLg: {
    width: applyWidthDifference(92),
    height: applyWidthDifference(102),
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalDivider: {
    backgroundColor: 'white',
    height: '50%',
    width: applyWidthDifference(6),
    paddingTop: applyWidthDifference(10),
  },
  mainSessionCard: {
    width: '70%',
    alignSelf: 'center',
  },
  sessionWorkoutRow: {
    flexDirection: 'row',
  },
  workoutBullet: {
    alignSelf: 'center',
    marginRight: applyWidthDifference(8),
  },
});
