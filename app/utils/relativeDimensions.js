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

/**
 * Scales a font size based on the screen height. This is useful for setting font sizes where a
 * smaller font size is used for smaller screens and a bigger font size is used for bigger screens.
 *
 * The following scale is used:
 * Screen heights less than or equal to 480 (e.g., iPhone 4s): 1x
 * Screen heights between 481 and 568, inclusive (e.g., iPhone 5): 1.166x
 * Screen heights greater than or equal to 569: 1.333x
 *
 * @param {Number} baseSize The default, smallest, size to scale from
 */
const getResponsiveFontSize = (baseSize) => {
  if (height > 568) return baseSize * 1.333;
  if (height > 480) return baseSize * 1.166;
  return baseSize;
};

/**
 * Returns a size scaled based on the device's font scaling factor so that the
 * new size will be as if there was no font scaling applied.
 * On iOS, this is essentially a no-op since font scale will always be the same
 * as the device pixel density. On Android, this will adjust the font size based
 * on the system's font scaling factor so the font size will look the same
 * regardless of device screen size and scaling factors.
 * @param {Number} size The intended size based on normal font scaling
 * @return {Number} The adjusted size
 */
const noScale = size => size * (PixelRatio.get() / PixelRatio.getFontScale());

export default {
  widthDifference,
  heightDifference,
  applyWidthDifference,
  fixedResponsiveFontSize,
  height,
  width,
  getResponsiveFontSize,
  noScale,
};
