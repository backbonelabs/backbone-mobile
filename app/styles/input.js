import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

export default EStyleSheet.create({
  $placeholderTextColor: '#A9A9A9',
  $color: '#231F20',
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputField: {
    color: '$color',
    fontSize: '1rem',
    borderColor: '#979797',
    borderWidth: 1,
    borderRadius: 5,
    width: 235 * relativeDimensions.widthDifference,
    height: 39 * relativeDimensions.heightDifference,
    paddingHorizontal: 10 * relativeDimensions.widthDifference,
    paddingVertical: 10 * relativeDimensions.heightDifference,
  },
  icon: {
    position: 'relative',
    right: 20 * relativeDimensions.widthDifference,
  },
  disabled: {
    color: '$disabledColor',
  },
});
