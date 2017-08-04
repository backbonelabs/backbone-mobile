import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import color from 'color';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

const buttonShadow = {
  ...Platform.select({
      // OS-specific drop shadow styling
    ios: {
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowRadius: 4,
      shadowOpacity: 0.15,
    },
  }),
};

export default EStyleSheet.create({
  button: {
    justifyContent: 'center',
    backgroundColor: '$secondaryColor',
    width: applyWidthDifference(150),
    height: applyWidthDifference(50),
    borderRadius: 3,
  },
  primaryBtn: {
    ...buttonShadow,
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
  },
  facebookBtn: {
    justifyContent: 'center',
    backgroundColor: '#3b5998',
    width: '100%',
    ...buttonShadow,
  },
  secondaryActive: {
    backgroundColor: '#F5F5F5',
  },
  secondaryTextStyles: {
    color: '#AAAAAA',
  },
  secondaryTextActive: {
    color: '#000000',
  },
  disabledButton: {
    backgroundColor: () => (
      color(EStyleSheet.value('$secondaryColor')).clearer(0.4).rgbString() // 40% opacity
    ),
  },
  disabledSecondaryText: {
    color: () => (
      color(EStyleSheet.value('$primaryColor')).clearer(0.4).rgbString() // 40% opacity
    ),
  },
  disabledSecondaryBorder: {
    borderColor: () => (
      color(EStyleSheet.value('$primaryColor')).clearer(0.4).rgbString() // 40% opacity
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
      color('#FFFFFF').clearer(0.4).rgbString() // 40% opacity
    ),
  },
});
