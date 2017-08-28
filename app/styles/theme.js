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

const red700 = '#D32F2F';
const orange500 = '#FF9800';
const green400 = '#32CD32';
const grey50 = '#FAFAFA';
const grey100 = '#F5F5F5';
const grey200 = '#EEEEEE';
const grey500 = '#9E9E9E';
const primaryColor = '#ED1C24';
const secondaryColor = orange500;
const primaryFont = 'Lato';
const lightBlueColor = '#03A9F4';
const primaryFontColor = '#231F20';
const secondaryFontColor = '#A9A9A9';
const activeBorderColor = '#85181C';
const disabledColor = grey500;
const inputIconColor = disabledColor;
const bannerColor = grey200;
const warningColor = red700;
const infoColor = green400;

export default {
  orange500,
  grey50,
  grey100,
  grey500,
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
  infoColor,
  buttonBorderRadius: 4,
  titleBarHeight,
  statusBarHeight,
  totalNavHeight,
  screenWidth,
  inputIconColor,
  lightBlueColor,
};
