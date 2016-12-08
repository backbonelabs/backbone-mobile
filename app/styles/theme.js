import { Dimensions, Navigator } from 'react-native';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

const { width: screenWidth } = Dimensions.get('window');
const statusBarHeight = Navigator.NavigationBar.Styles.General.StatusBarHeight;
const titleBarHeight = 44 * heightDifference;
const totalNavHeight = statusBarHeight + titleBarHeight;
const iconSize = 0.08 * screenWidth;
const iconButtonSize = 1.5 * iconSize;
const inputIconSize = 16 * widthDifference;

const primaryColor = '#ED1C24';
const primaryFont = 'Lato';
const primaryFontColor = '#231F20';
const secondaryFontColor = '#A9A9A9';
const activeBorderColor = '#85181C';
const bannerColor = '#EEE';

export default {
  primaryColor,
  primaryFont,
  primaryFontColor,
  secondaryFontColor,
  activeBorderColor,
  disabledColor: '#A9A9A9',
  iconSize,
  iconButtonSize,
  inputIconSize,
  bannerColor,
  buttonBorderRadius: 4,
  titleBarHeight,
  statusBarHeight,
  totalNavHeight,
  screenWidth,
};
