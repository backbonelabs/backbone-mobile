import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { widthDifference } = relativeDimensions;

export default EStyleSheet.create({
  $itemWidth: 130 * 1.5 * widthDifference,
  $sliderWidth: '$screenWidth',
  container: {
    flex: 1,
  },
  header: {
    flex: 0.1,
    alignItems: 'center',
  },
  body: {
    flex: 0.5,
    justifyContent: 'space-around',
  },
  startButton: {
    alignSelf: 'center',
  },
  carouselContainer: {
    height: 150,
  },
  carouselItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '$itemWidth',
  },
  footer: {
    flex: 0.25,
    alignItems: 'center',
  },
  dailyStreakContainer: {
    alignItems: 'center',
  },
  streakCounter: {
    marginTop: -67,
  },
});
