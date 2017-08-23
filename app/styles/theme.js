import { Dimensions, Navigator } from 'react-native';
import relativeDimensions from '../utils/relativeDimensions';

const { fixedResponsiveFontSize, heightDifference } = relativeDimensions;

const { width: screenWidth } = Dimensions.get('window');
const statusBarHeight = Navigator.NavigationBar.Styles.General.StatusBarHeight;
const titleBarHeight = 44 * heightDifference;
const totalNavHeight = statusBarHeight + titleBarHeight;
const iconSize = 0.08 * screenWidth;
const iconButtonSize = 1.5 * iconSize;
const inputIconSize = fixedResponsiveFontSize(22);

const primaryColor = '#ED1C24';
const secondaryColor = '#FF9800';
const primaryFont = 'Lato';
const lightBlueColor = '#03A9F4';
const primaryFontColor = '#231F20';
const secondaryFontColor = '#A9A9A9';
const activeBorderColor = '#85181C';
const disabledColor = '#E0E0E0';
const inputIconColor = disabledColor;
const bannerColor = '#EEE';
const warningColor = '#D32F2F';
const greenColor = '#4CAF50';

export default {
  primaryColor,
  secondaryColor,
  primaryFont,
  primaryFontColor,
  secondaryFontColor,
  activeBorderColor,
  disabledColor,
  iconSize,
  iconButtonSize,
  inputIconSize,
  bannerColor,
  warningColor,
  buttonBorderRadius: 4,
  titleBarHeight,
  statusBarHeight,
  totalNavHeight,
  screenWidth,
  inputIconColor,
  lightBlueColor,
  greenColor,
};
