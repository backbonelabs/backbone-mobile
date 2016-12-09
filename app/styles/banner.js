import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
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
