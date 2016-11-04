import EStyleSheet from 'react-native-extended-stylesheet';
import theme from '../styles/theme';
import relativeDimensions from '../utils/relativeDimensions';

const baseTitleBarStyles = {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.primaryColor,
};

export default EStyleSheet.create({
  $leftButtonIconSize: 28 * relativeDimensions.heightDifference,
  visibleTitleBar: {
    ...baseTitleBarStyles,
    minHeight: theme.titleBarHeight,
  },
  hiddenTitleBar: {
    ...baseTitleBarStyles,
    height: 0,
  },
  title: {
    flex: 0.50,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sideContainers: {
    flex: 0.25,
    paddingHorizontal: 6 * relativeDimensions.widthDifference,
  },
  sideContainersText: {
    color: '#FFFFFF',
  },
  sideButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    color: '#FFFFFF',
    marginRight: 6 * relativeDimensions.widthDifference,
  },
});
