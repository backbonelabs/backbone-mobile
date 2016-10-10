import EStyleSheet from 'react-native-extended-stylesheet';
import color from 'color';

export default EStyleSheet.create({
  button: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
    minWidth: 150,
    maxWidth: 225,
    height: 40,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: () => (
      color(EStyleSheet.value('$primaryColor')).clearer(0.6).rgbString() // 40% opacity
    ),
  },
  text: {
    color: 'white',
    textAlign: 'center',
  },
  disabledText: {
    color: () => (
      color('#FFFFFF').clearer(0.6).rgbString() // 40% opacity
    ),
  },
});
