import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import color from 'color';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  button: {
    justifyContent: 'center',
    backgroundColor: '$secondaryColor',
    width: applyWidthDifference(150),
    height: applyWidthDifference(50),
    borderRadius: 3,
  },
  defaultBtn: {
    backgroundColor: 'white',
  },
  secondaryBtn: {
    backgroundColor: '#03A9F4',
  },
  facebookBtn: {
    justifyContent: 'center',
    backgroundColor: '#3b5998',
    width: '100%',
  },
  defaultActive: {
    backgroundColor: '#F5F5F5',
  },
  defaultTextStyles: {
    color: '#AAAAAA',
  },
  defaultTextActive: {
    color: '#000000',
  },
  disabledButton: {
    ...Platform.select({
      // OS-specific drop shadow styling
      ios: {
        backgroundColor: () => (
          color(EStyleSheet.value('$secondaryColor')).clearer(0.4).rgbString() // 60% opacity
        ),
      },
      android: {
        backgroundColor: '#FFCC80',
      },
    }),
  },
  disabledSecondaryText: {
    color: () => (
      color(EStyleSheet.value('$primaryColor')).clearer(0.4).rgbString() // 60% opacity
    ),
  },
  disabledSecondaryBorder: {
    borderColor: () => (
      color(EStyleSheet.value('$primaryColor')).clearer(0.4).rgbString() // 60% opacity
    ),
  },
  text: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  disabledText: {
    color: () => (
      color('#FFFFFF').clearer(0.4).rgbString() // 60% opacity
    ),
  },
});
