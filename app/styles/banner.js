import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference } = relativeDimensions;

export default EStyleSheet.create({
  banner: {
    flexDirection: 'row',
    backgroundColor: '$bannerColor',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    padding: 4 * widthDifference,
    color: '$primaryFontColor',
  },
});
