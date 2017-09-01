import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { getResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  body: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: getResponsiveFontSize(12),
  },
  secondary: {
    color: '$secondaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: getResponsiveFontSize(10),
  },
  heading1: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: getResponsiveFontSize(20),
    lineHeight: Math.floor(getResponsiveFontSize(26)),
  },
  heading2: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: getResponsiveFontSize(18),
    lineHeight: Math.floor(getResponsiveFontSize(22)),
  },
  heading3: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: getResponsiveFontSize(16),
    lineHeight: Math.floor(getResponsiveFontSize(18)),
  },
});
