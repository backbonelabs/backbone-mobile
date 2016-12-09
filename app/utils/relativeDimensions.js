import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const widthDifference = width / 375;
const heightDifference = height / 667;

/**
 * Applies widthDifference to input measurement value
 * @param  {Number} input  Measurement (pixels)
 * @return {Number}        Input with widthDifference applied
 */

const applyWidthDifference = input => input * widthDifference;

export default {
  widthDifference,
  heightDifference,
  applyWidthDifference,
};
