import { Dimensions, Navigator } from 'react-native';

const { width } = Dimensions.get('window');
const totalNavHeight = Navigator.NavigationBar.Styles.General.TotalNavHeight;
const iconSize = 0.08 * width;
const iconButtonSize = 1.5 * iconSize;

const primaryColor = '#ED1C24';
const primaryFont = 'Lato';
const primaryFontColor = '#231F20';
const secondaryFontColor = '#A9A9A9';
const disabledPrimaryFontColor = 'rgba(255, 255, 255, 0.4)';
const disabledSecondaryFontColor = 'rgba(237, 29, 35, 0.4)';
const pressedButtonFontColor = 'rgba(134, 25, 28, 0.4)';

export default {
  primaryColor,
  primaryFont,
  primaryFontColor,
  secondaryFontColor,
  disabledPrimaryFontColor,
  disabledSecondaryFontColor,
  pressedButtonFontColor,
  disabledColor: '#ccc',
  iconSize,
  iconButtonSize,
  rem: 16,
  buttonBorderRadius: 4,
  totalNavHeight,
};
