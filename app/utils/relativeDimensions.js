import {
  Dimensions,
  PixelRatio,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const widthDifference = width / 375;
const heightDifference = height / 667;
const defaultScaleRatio = 1.75; // Lower bound from the 16:9 ratio
const scaleRatioPortrait = height / width; // Used for portrait-oriented app
const scaleRatioLandscape = width / height; // Used for landscape-oriented app

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
 * @param  {Number} size The base size based on the iPhone 5 with no font scaling
 * @return {Number}      The adjusted font size
 */
const fixedResponsiveFontSize = size =>
  applyWidthDifference(size) * (PixelRatio.get() / PixelRatio.getFontScale());

/**
 * Scales a font size based on the widthDifference. This can still be affected by
 * the phone's font scaling factor if the Text component used doesn't disable
 * font scaling.
 * @param {Number} size The base size based on the iPhone 5 with no font scaling
 * @return {Number} The scaled font size
 */
const getResponsiveFontSize = (size) => applyWidthDifference(size);

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
  defaultScaleRatio,
  scaleRatioLandscape,
  scaleRatioPortrait,
};
