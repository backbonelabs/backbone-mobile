import {
  Dimensions,
  PixelRatio,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const widthDifference = width / 375;
const heightDifference = height / 667;

/**
 * Applies widthDifference to input measurement value
 * @param  {Number} input Measurement (density-independent pixels)
 * @return {Number}       Input with widthDifference applied
 */

const applyWidthDifference = input => input * widthDifference;

/**
 * Returns a font size scaled based on the widthDifference, and the font size
 * is not affected by the phone's font scaling factor.
 * On iOS, this is essentially a no-op since font scale will always be the same
 * as the device pixel density. On Android, this will adjust the font size based
 * on the system's font scaling factor so the font size will look the same
 * regardless of device screen size and scaling factors.
 * @param  {Number} size The original or base font size in density-independent pixels
 * @return {Number}      The adjusted font size
 */
const fixedResponsiveFontSize = size =>
  applyWidthDifference(size) * (PixelRatio.get() / PixelRatio.getFontScale());

export default {
  widthDifference,
  heightDifference,
  applyWidthDifference,
  fixedResponsiveFontSize,
  height,
  width,
};
