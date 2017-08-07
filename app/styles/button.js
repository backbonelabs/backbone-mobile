import EStyleSheet from 'react-native-extended-stylesheet';
import color from 'color';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  button: {
    justifyContent: 'center',
    backgroundColor: '$secondaryColor',
    width: applyWidthDifference(150),
    height: applyWidthDifference(50),
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
  },
  facebookBtn: {
    justifyContent: 'center',
    backgroundColor: '#3b5998',
    width: '100%',
  },
  secondaryActive: {
    borderColor: '#CCCCCC',
    borderWidth: 1,
    backgroundColor: '#FFF',
  },
  secondaryTextStyles: {
    color: '#AAAAAA',
  },
  secondaryTextActive: {
    color: '#000000',
  },
  disabledButton: {
    backgroundColor: () => (
      color(EStyleSheet.value('$secondaryColor')).clearer(0.0).rgbString() // 40% opacity
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
    fontSize: fixedResponsiveFontSize(15),
    fontWeight: 'bold',
  },
  disabledText: {
    color: () => (
      color('#FFFFFF').clearer(0.6).rgbString() // 40% opacity
    ),
  },
});
