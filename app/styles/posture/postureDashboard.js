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
    justifyContent: 'flex-end',
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
  carouselItemIcon: {
    width: 130.5 * widthDifference,
    height: 130.5 * widthDifference,
    resizeMode: 'contain',
  },
  footer: {
    flex: 0.35,
    alignItems: 'center',
  },
  dailyStreakContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyStreakTitle: {
    marginBottom: 10 * heightDifference,
  },
  dailyStreakBanner: {
    width: 55 * widthDifference,
    height: 86 * widthDifference,
    resizeMode: 'contain',
    alignItems: 'center',
    paddingTop: 19 * widthDifference,
  },
});
