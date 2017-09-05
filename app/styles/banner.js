import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, getResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  $bannerIconSize: getResponsiveFontSize(12),
  banner: {
    flexDirection: 'row',
    backgroundColor: '$bannerColor',
    alignItems: 'center',
    justifyContent: 'center',
    padding: applyWidthDifference(4),
  },
  bannerText: {
    marginHorizontal: applyWidthDifference(4),
    color: '$primaryFontColor',
  },
});
