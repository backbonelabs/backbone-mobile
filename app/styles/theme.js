import { Dimensions, Navigator } from 'react-native';
import relativeDimensions from '../utils/relativeDimensions';

const { width: screenWidth } = Dimensions.get('window');
const statusBarHeight = Navigator.NavigationBar.Styles.General.StatusBarHeight;
const titleBarHeight = 44 * relativeDimensions.heightDifference;
const totalNavHeight = statusBarHeight + titleBarHeight;
const iconSize = 0.08 * screenWidth;
const iconButtonSize = 1.5 * iconSize;

const primaryColor = '#ED1C24';
const primaryFont = 'Lato';
const primaryFontColor = '#231F20';
const secondaryFontColor = '#A9A9A9';
const activeBorderColor = '#85181C';

export default {
  primaryColor,
  primaryFont,
  primaryFontColor,
  secondaryFontColor,
  activeBorderColor,
  disabledColor: '#ccc',
  iconSize,
  iconButtonSize,
  rem: 16,
  buttonBorderRadius: 4,
  titleBarHeight,
  statusBarHeight,
  totalNavHeight,
  screenWidth,
};
