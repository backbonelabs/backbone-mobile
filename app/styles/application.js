import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

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
    height: applyWidthDifference(60),
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
    height: applyWidthDifference(30),
    width: applyWidthDifference(30),
    resizeMode: 'contain',
  },
  partialModalTextContainer: {
    height: '5%',
  },
  partialModalBodyText: {
    textAlign: 'center',
  },
  partialSpinnerContainer: {
    height: '8%',
  },
});
