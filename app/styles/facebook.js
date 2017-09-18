import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  fbBtn: {
    borderRadius: 3,
    height: applyWidthDifference(50),
  },
  fbBtnText: {
    fontWeight: 'bold',
  },
});
