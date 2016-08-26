import { Dimensions } from 'react-native';

const iconSize = 0.08 * Dimensions.get('window').width;
const iconButtonSize = 1.5 * iconSize;

export default {
  primaryColor: '#e73e3a',
  navIconColor: '#7e7e7e',
  iconSize,
  iconButtonSize,
  rem: 16,
  buttonBorderRadius: 4,
};
