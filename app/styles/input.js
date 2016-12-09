import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  $placeholderTextColor: '$secondaryFontColor',
  $iconColor: '$primaryFontColor',
  $iconSize: '$inputIconSize',
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputField: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: applyWidthDifference(18),
    borderColor: '#979797',
    borderWidth: 1,
    borderRadius: 5,
    width: applyWidthDifference(235),
    height: 44 * heightDifference,
    paddingHorizontal: applyWidthDifference(25),
    paddingVertical: 10 * heightDifference,
  },
  icon: {
    position: 'relative',
    right: applyWidthDifference(25),
  },
  disabled: {
    color: '$disabledColor',
  },
});
