import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference } = relativeDimensions;

export default EStyleSheet.create({
  body: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: 18 * widthDifference,
  },
  secondary: {
    color: '$secondaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: 16 * widthDifference,
  },
  heading1: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: 26 * widthDifference,
    lineHeight: 32 * widthDifference,
  },
  heading2: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: 22 * widthDifference,
    lineHeight: 26 * widthDifference,
  },
  heading3: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: 20 * widthDifference,
    lineHeight: 22 * widthDifference,
  },
});
