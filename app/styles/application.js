import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

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
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: -3,
        },
        shadowRadius: 4,
        shadowOpacity: 0.15,
      },
      android: {
        borderTopWidth: 2,
        borderTopColor: '$grey300',
      },
    }),
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
  partialSpinnerContainer: {
    height: applyWidthDifference(25),
  },
  bluetoothDisabledIcon: {
    color: '$warningColor',
    fontSize: fixedResponsiveFontSize(40),
  },
});
