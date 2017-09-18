import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  checkbox: {
    width: applyWidthDifference(25),
    height: applyWidthDifference(25),
    borderRadius: 3,
    borderWidth: 1.5,
    backgroundColor: 'white',
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
