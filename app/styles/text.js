import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { noScale, getResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  body: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: noScale(getResponsiveFontSize(12)),
  },
  secondary: {
    color: '$secondaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: noScale(getResponsiveFontSize(10)),
  },
  heading1: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: noScale(getResponsiveFontSize(20)),
    lineHeight: Math.floor(noScale(getResponsiveFontSize(24))),
  },
  heading2: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: noScale(getResponsiveFontSize(18)),
    lineHeight: Math.floor(noScale(getResponsiveFontSize(22))),
  },
  heading3: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: noScale(getResponsiveFontSize(16)),
    lineHeight: Math.floor(noScale(getResponsiveFontSize(20))),
  },
});
