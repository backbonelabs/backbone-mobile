import mapLevelToColor, { colors } from '../../app/utils/mapLevelToColor';

describe('mapLevelToColor', () => {
  const totalColors = colors.length;

  test('returns the correct color when passed a level less than the count of colors', () => {
    colors.forEach((color, idx) => {
      expect(mapLevelToColor(idx)).toBe(colors[idx]);
    });
  });

  test('returns the correct color when passed a level greater than the count of colors', () => {
    expect(mapLevelToColor(totalColors)).toBe(colors[0]);
    expect(mapLevelToColor((totalColors * 3) - 1)).toBe(colors[totalColors - 1]);
  });
});
