import EStyleSheet from 'react-native-extended-stylesheet';
import color from 'color';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  button: {
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
    width: applyWidthDifference(150),
    height: 45 * heightDifference,
    borderRadius: 5,
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '$primaryColor',
  },
  secondaryActive: {
    borderColor: '$activeBorderColor',
    borderWidth: 1,
    backgroundColor: '#FFF',
  },
  secondaryTextStyles: {
    color: '$primaryColor',
  },
  secondaryTextActive: {
    color: '$activeBorderColor',
  },
  disabledButton: {
    backgroundColor: () => (
      color(EStyleSheet.value('$primaryColor')).clearer(0.6).rgbString() // 40% opacity
    ),
  },
  disabledSecondaryText: {
    color: () => (
      color(EStyleSheet.value('$primaryColor')).clearer(0.6).rgbString() // 40% opacity
    ),
  },
  disabledSecondaryBorder: {
    borderColor: () => (
      color(EStyleSheet.value('$primaryColor')).clearer(0.6).rgbString() // 40% opacity
    ),
  },
  text: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  disabledText: {
    color: () => (
      color('#FFFFFF').clearer(0.6).rgbString() // 40% opacity
    ),
  },
});
