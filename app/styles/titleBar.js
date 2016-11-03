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
    minHeight: 44 * relativeDimensions.heightDifference,
  },
  hiddenTitleBar: {
    ...baseTitleBarStyles,
    height: 0,
  },
  title: {
    flex: 0.34,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sideContainers: {
    flex: 0.33,
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
