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
const grey300 = '#E0E0E0';
const grey400 = '#BDBDBD';
const grey500 = '#9E9E9E';
const grey600 = '#757575';
const red500 = '#F44336';
const lightBlue200 = '#90CAF9';
const lightBlue500 = '#03A9F4';
const blue500 = '#2196F3';
const primaryColor = '#ED1C24';
const secondaryColor = orange500;
const primaryFont = 'Lato';
const primaryFontColor = 'rgba(0, 0, 0, 0.87)';
const secondaryFontColor = 'rgba(0, 0, 0, 0.54)';
const disabledFontColor = 'rgba(0, 0, 0, 0.38)';
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
  grey200,
  grey300,
  grey400,
  grey500,
  grey600,
  green400,
  red500,
  lightBlue200,
  lightBlue500,
  blue500,
  primaryColor,
  secondaryColor,
  primaryFont,
  primaryFontColor,
  secondaryFontColor,
  disabledFontColor,
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
};
