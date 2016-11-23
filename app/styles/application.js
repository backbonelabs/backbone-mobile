import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

const absoluteCenter = {
  alignItems: 'center',
  justifyContent: 'center',
};

const navButton = {
  ...absoluteCenter,
  width: '$iconButtonSize',
  height: '$iconButtonSize',
};

export default EStyleSheet.create({
  spinner: {
    ...absoluteCenter,
  },
  leftButton: {
    ...navButton,
    paddingLeft: '1.5%',
  },
  rightButton: {
    ...navButton,
    paddingRight: '1.5%',
  },
  leftButtonIcon: {
    alignSelf: 'center',
    color: '$primaryColor',
  },
  tabBar: {
    height: 62 * heightDifference,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'white',
  },
  tabBarItem: {
    ...absoluteCenter,
  },
  activeTabBarImage: {
    color: '$primaryColor',
  },
  inactiveTabBarImage: {
    color: '$disabledColor',
  },
  tabBarImage: {
    height: 30 * heightDifference,
    width: 30 * widthDifference,
    resizeMode: 'contain',
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: '#EEE',
    ...absoluteCenter,
  },
  bannerIcon: {
    paddingTop: 1 * heightDifference,
  },
  bannerText: {
    color: '$primaryFontColor',
    padding: 4 * widthDifference,
  },
});
