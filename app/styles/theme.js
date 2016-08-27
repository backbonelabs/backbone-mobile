import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const iconSize = 0.08 * width;
const iconButtonSize = 1.5 * iconSize;

export default {
  primaryColor: '#e73e3a',
  navIconColor: '#7e7e7e',
  iconSize,
  iconButtonSize,
  rem: 16,
  buttonBorderRadius: 4,
};
