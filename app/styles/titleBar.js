import EStyleSheet from 'react-native-extended-stylesheet';
import theme from '../styles/theme';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, heightDifference } = relativeDimensions;

const baseTitleBarStyles = {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.primaryColor,
};

const baseSideButtonStyles = {
  alignItems: 'center',
  paddingHorizontal: applyWidthDifference(6),
};

export default EStyleSheet.create({
  $leftButtonIconSize: 28 * heightDifference,
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
  },
  sideContainersText: {
    color: '#FFFFFF',
  },
  leftComponent: {
    ...baseSideButtonStyles,
    flexDirection: 'row',
  },
  rightComponent: {
    ...baseSideButtonStyles,
    flexDirection: 'row-reverse',
  },
  buttonIcon: {
    color: '#FFFFFF',
    marginRight: applyWidthDifference(6),
  },
});
