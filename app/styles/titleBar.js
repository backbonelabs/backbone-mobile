import EStyleSheet from 'react-native-extended-stylesheet';
import color from 'color';
import theme from '../styles/theme';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

const baseTitleBarStyles = {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white',
};

const baseSideButtonStyles = {
  alignItems: 'center',
  paddingHorizontal: applyWidthDifference(6),
};

const baseIconStyles = {
  width: applyWidthDifference(30),
  height: applyWidthDifference(30),
};

export default EStyleSheet.create({
  $backButtonIconSize: applyWidthDifference(40),
  $profileIconSize: applyWidthDifference(30),
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
    marginRight: applyWidthDifference(6),
  },
  icon: {
    ...baseIconStyles,
  },
  profileIcon: {
    ...baseIconStyles,
    borderRadius: applyWidthDifference(15),
    backgroundColor: '$disabledColor',
  },
});
