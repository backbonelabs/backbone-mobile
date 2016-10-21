import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  $carouselItemWidth: 150,
  $carouselItemAvatarWidth: '$carouselItemWidth - 10',
  $sliderWidth: Dimensions.get('window').width,
  container: {
    flex: 1,
    marginTop: '$totalNavHeight',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  sessionContainer: {
    alignItems: 'center',
  },
  sessionIcon: {
    backgroundColor: 'red',
    borderRadius: '$carouselItemAvatarWidth * 0.5',
    width: '$carouselItemAvatarWidth',
    height: '$carouselItemAvatarWidth',
  },
  carouselItemContainer: {
    paddingTop: 5,
    paddingBottom: 5,
  },
  carousel: {
    width: '$carouselItemWidth',
  },
  footer: {
    alignItems: 'center',
  },
  streakCounter: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 10,
  },
});
