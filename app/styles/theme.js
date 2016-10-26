import { Dimensions, Navigator } from 'react-native';

const { width } = Dimensions.get('window');
const totalNavHeight = Navigator.NavigationBar.Styles.General.TotalNavHeight;
const iconSize = 0.08 * width;
const iconButtonSize = 1.5 * iconSize;

const primaryColor = '#ED1C24';
const primaryFont = 'Lato';
const primaryFontColor = '#231F20';
const secondaryFontColor = '#A9A9A9';

export default {
  primaryColor,
  primaryFont,
  primaryFontColor,
  secondaryFontColor,
  disabledColor: '#ccc',
  iconSize,
  iconButtonSize,
  rem: 16,
  buttonBorderRadius: 4,
  totalNavHeight,
};
