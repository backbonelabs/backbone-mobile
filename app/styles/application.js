import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

const navButton = {
  width: '$iconButtonSize',
  height: '$iconButtonSize',
  alignItems: 'center',
  justifyContent: 'center',
};

export default EStyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'center',
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
});
