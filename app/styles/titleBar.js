import EStyleSheet from 'react-native-extended-stylesheet';
import color from 'color';
import theme from '../styles/theme';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

const baseTitleBarStyles = {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
};

const baseSideButtonStyles = {
  alignItems: 'center',
  paddingHorizontal: applyWidthDifference(6),
};

export default EStyleSheet.create({
  $leftButtonIconSize: fixedResponsiveFontSize(40),
  visibleTitleBar: {
    ...baseTitleBarStyles,
    minHeight: theme.titleBarHeight,
  },
  hiddenTitleBar: {
    ...baseTitleBarStyles,
    height: 0,
  },
  centerContainer: {
    flex: 0.50,
    color: '$secondaryColor',
    backgroundColor: 'transparent',
    textAlign: 'center',
    fontSize: fixedResponsiveFontSize(18),
    fontWeight: 'bold',
  },
  sideContainers: {
    flex: 0.25,
  },
  sideContainersText: {
    color: '#FFFFFF',
  },
  sideContainersTextDisable: {
    color: color('#FFFFFF').clearer(0.6).rgbString(),
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
    color: '$secondaryColor',
    marginRight: applyWidthDifference(6),
  },
  buttonIconDisabled: {
    color: color('#FFFFFF').clearer(0.6).rgbString(),
    marginRight: applyWidthDifference(6),
  },
});
