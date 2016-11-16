import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  $placeholderTextColor: '$secondaryFontColor',
  $color: '$primaryFontColor',
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
    width: 235 * widthDifference,
    height: 44 * heightDifference,
    paddingHorizontal: 20 * widthDifference,
    paddingVertical: 10 * heightDifference,
  },
  icon: {
    position: 'relative',
    right: 20 * widthDifference,
  },
  disabled: {
    color: '$disabledColor',
  },
});
