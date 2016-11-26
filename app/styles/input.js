import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';
import text from './text';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputField: {
    borderColor: '#979797',
    borderWidth: 1,
    borderRadius: 5,
    width: 235 * widthDifference,
    height: 44 * heightDifference,
    paddingHorizontal: 12.5 * widthDifference,
    paddingVertical: 10 * heightDifference,
    ...text._body,
  },
  icon: {
    position: 'relative',
    right: 25 * widthDifference,
  },
  disabled: {
    color: '$disabledColor',
  },
});
