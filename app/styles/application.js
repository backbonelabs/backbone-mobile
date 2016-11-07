import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const navButton = {
  width: '$iconButtonSize',
  height: '$iconButtonSize',
  alignItems: 'center',
  justifyContent: 'center',
};

export default EStyleSheet.create({
  leftButton: Object.assign({}, navButton, { paddingLeft: '1.5%' }),
  rightButton: Object.assign({}, navButton, { paddingRight: '1.5%' }),
  leftButtonIcon: {
    alignSelf: 'center',
    color: '$primaryColor',
  },
  tabBar: {
    height: 59,
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
    height: 30 * relativeDimensions.heightDifference,
    width: 30 * relativeDimensions.widthDifference,
  },
});
