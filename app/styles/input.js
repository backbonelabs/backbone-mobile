import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputField: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: 18 * widthDifference,
    borderColor: '#979797',
    borderWidth: 1,
    borderRadius: 5,
    width: 235 * widthDifference,
    height: 44 * heightDifference,
    paddingHorizontal: 12.5 * widthDifference,
    paddingVertical: 10 * heightDifference,
  },
  icon: {
    position: 'relative',
    right: 25 * widthDifference,
  },
  disabled: {
    color: '$disabledColor',
  },
});
