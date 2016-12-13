import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  body: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: fixedResponsiveFontSize(18),
  },
  secondary: {
    color: '$secondaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: fixedResponsiveFontSize(16),
  },
  heading1: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: fixedResponsiveFontSize(26),
    lineHeight: Math.ceil(fixedResponsiveFontSize(32)),
  },
  heading2: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: fixedResponsiveFontSize(22),
    lineHeight: Math.ceil(fixedResponsiveFontSize(26)),
  },
  heading3: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: fixedResponsiveFontSize(20),
    lineHeight: Math.ceil(fixedResponsiveFontSize(22)),
  },
});
