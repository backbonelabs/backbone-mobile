import EStyleSheet from 'react-native-extended-stylesheet';
import color from 'color';

export const hexCodes = {
  purple: '#9C27B0', // Material purple 500
  blue: '#03A9F4', // Material light blue 500
  green: '#8BC34A', // Material light green 500
  orange: '#FF9800', // Material orange 500
  red: '#F44336', // Material red 500
};

export const colors = [
  'purple',
  'purple',
  'blue',
  'blue',
  'green',
  'green',
  'orange',
  'orange',
  'red',
  'red',
];

/**
 * Maps a level (0-index based) to a color hex code
 * @param {Number} level Integer representing the level based on a 0-index,
 *                       i.e., 0 is level 1, 1 is level 2, etc.
 * @return {String} The color hex code
 */
export const getColorHexForLevel = level => hexCodes[colors[level % colors.length]];

/**
 * Maps a level (0-index based) to a color hex code for the underlay
 * @param {Number} level Integer representing the level based on a 0-index,
 *                       i.e., 0 is level 1, 1 is level 2, etc.
 * @return {String} The color hex code
 */
export const getColorHexForLevelUnderlay = level =>
color(EStyleSheet.value(getColorHexForLevel(level))).clearer(0.5).rgbString();

/**
 * Maps a level (0-index based) to a color name
 * @param {Number} level Integer representing the level based on a 0-index,
 *                       i.e., 0 is level 1, 1 is level 2, etc.
 * @return {String} The color name
 */
export const getColorNameForLevel = level => colors[level % colors.length];
