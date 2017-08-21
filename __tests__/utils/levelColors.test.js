import {
  colors,
  hexCodes,
  getColorHexForLevel,
  getColorNameForLevel,
} from '../../app/utils/levelColors';

describe('levelColors', () => {
  describe('hexCodes', () => {
    test('is an array of hex codes', () => {
      Object.values(hexCodes).forEach(hexCode => {
        expect(typeof hexCode).toBe('string');
        expect(hexCode.startsWith('#')).toBeTruthy();
      });
    });
  });

  describe('getColorNameForLevel', () => {
    const totalColors = colors.length;

    test('returns the correct color when passed a level less than the count of colors', () => {
      colors.forEach((color, idx) => {
        expect(getColorNameForLevel(idx)).toBe(colors[idx]);
      });
    });

    test('returns the correct color when passed a level greater than the count of colors', () => {
      expect(getColorNameForLevel(totalColors)).toBe(colors[0]);
      expect(getColorNameForLevel((totalColors * 3) - 1)).toBe(colors[totalColors - 1]);
    });
  });

  describe('getColorHexForLevel', () => {
    test('returns a hex code for a level', () => {
      const totalColors = colors.length;
      colors.forEach((color, idx) => {
        expect(getColorHexForLevel(idx)).toBe(hexCodes[colors[idx]]);
        // Test when the level argument is greater than the number of colors
        expect(getColorHexForLevel(totalColors + idx)).toBe(hexCodes[colors[idx]]);
      });
    });
  });
});
