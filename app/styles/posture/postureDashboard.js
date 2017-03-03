import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  $sessionIconSize: applyWidthDifference(130),
  $sessionIconContainerWidth: '$sessionIconSize * 1.5',
  $sliderWidth: '100%',
  container: {
    flex: 1,
  },
  header: {
    flex: 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 0.85,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  sessionIcon: {
    width: '$sessionIconSize',
    height: '$sessionIconSize',
  },
  carouselContainer: {
    height: '$sessionIconSize * 1.1',
  },
  carouselItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '$sessionIconContainerWidth',
  },
  dailyStreakContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyStreakTitle: {
    marginBottom: 8 * heightDifference,
  },
  dailyStreakBanner: {
    width: applyWidthDifference(76),
    height: applyWidthDifference(100),
    resizeMode: 'contain',
  },
  streakCounter: {
    marginTop: applyWidthDifference(-73),
  },
  partialModalBodyText: {
    textAlign: 'center',
  },
  partialModalButtonView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: applyWidthDifference(10),
  },
  partialModalButton: {
    width: applyWidthDifference(125),
  },
});
