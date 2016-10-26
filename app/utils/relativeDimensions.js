import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const widthDifference = width / 375;
const heightDifference = height / 667;

export default {
  widthDifference,
  heightDifference,
};
