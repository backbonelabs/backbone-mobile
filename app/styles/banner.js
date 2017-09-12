import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, getResponsiveFontSize, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  $bannerIconSize: fixedResponsiveFontSize(14),
  banner: {
    flexDirection: 'row',
    backgroundColor: '$bannerColor',
    alignItems: 'center',
    justifyContent: 'center',
    padding: applyWidthDifference(4),
  },
  bannerText: {
    marginHorizontal: applyWidthDifference(4),
    fontSize: getResponsiveFontSize(14),
  },
});
