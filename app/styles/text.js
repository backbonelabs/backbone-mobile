import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  body: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: applyWidthDifference(18),
  },
  secondary: {
    color: '$secondaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: applyWidthDifference(16),
  },
  heading1: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: applyWidthDifference(26),
    lineHeight: Math.ceil(applyWidthDifference(32)),
  },
  heading2: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: applyWidthDifference(22),
    lineHeight: Math.ceil(applyWidthDifference(26)),
  },
  heading3: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: applyWidthDifference(20),
    lineHeight: Math.ceil(applyWidthDifference(22)),
  },
});
