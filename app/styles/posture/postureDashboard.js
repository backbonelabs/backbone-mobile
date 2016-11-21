import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  $itemWidth: 130 * 1.5 * widthDifference,
  $sliderWidth: '100%',
  container: {
    flex: 1,
  },
  header: {
    flex: 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    flex: 0.5,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  carouselContainer: {
    height: '$itemWidth',
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
    justifyContent: 'center',
  },
  dailyStreakTitle: {
    marginBottom: 8 * heightDifference,
  },
  dailyStreakBanner: {
    width: 55 * widthDifference,
    height: 86 * heightDifference,
    resizeMode: 'contain',
  },
  streakCounter: {
    marginTop: -67 * heightDifference,
  },
});
