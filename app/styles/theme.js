import { Dimensions } from 'react-native';

const iconSize = (0.08 * Dimensions.get('window').width);
const iconButton = iconSize + (0.5 * iconSize);

export default {
  primaryColor: '#e73e3a',
  iconSize,
  iconButton,
  rem: 16,
};
