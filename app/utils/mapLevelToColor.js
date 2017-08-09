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
 * Maps a level (0-index based) to a color
 * @param {Number} level Integer representing the level based on a 0-index,
 *                       i.e., 0 is level 1, 1 is level 2, etc.
 */
export default level => colors[level % colors.length];
