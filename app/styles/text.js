import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { getResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  body: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: getResponsiveFontSize(16),
  },
  secondary: {
    color: '$secondaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: getResponsiveFontSize(14),
  },
  heading1: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: getResponsiveFontSize(24),
    lineHeight: Math.floor(getResponsiveFontSize(28)),
  },
  heading2: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: getResponsiveFontSize(22),
    lineHeight: Math.floor(getResponsiveFontSize(26)),
  },
  heading3: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: getResponsiveFontSize(20),
    lineHeight: Math.floor(getResponsiveFontSize(24)),
  },
});
