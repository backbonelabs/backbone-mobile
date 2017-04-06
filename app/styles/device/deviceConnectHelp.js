import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference,
        fixedResponsiveFontSize,
} = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    width: applyWidthDifference(300),
  },
  title: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: fixedResponsiveFontSize(20),
    textAlign: 'center',
    lineHeight: Math.ceil(fixedResponsiveFontSize(32)),
  },
  items: {
    color: '$primaryFontColor',
    paddingTop: applyWidthDifference(30),
    fontFamily: '$primaryFont',
    fontSize: fixedResponsiveFontSize(18),
    lineHeight: Math.ceil(fixedResponsiveFontSize(26)),
  },
  help: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    textAlign: 'center',
    paddingTop: applyWidthDifference(60),
    fontSize: fixedResponsiveFontSize(18),
  },
});
