import EStyleSheet from 'react-native-extended-stylesheet';
import color from 'color';

export default EStyleSheet.create({
  button: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
    minWidth: 150,
    maxWidth: 225,
    width: 150,
    height: 40,
    paddingTop: 10,
    paddingRight: 20,
    paddingBottom: 11,
    paddingLeft: 20,
    borderRadius: 5,
  },
  buttonActive: {
    backgroundColor: '#85181C',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '$primaryColor',
  },
  secondaryActive: {
    borderColor: '#85181C',
    borderWidth: 1,
    backgroundColor: '#FFF',
  },
  secondaryTextStyles: {
    color: '#ED1C24',
  },
  secondaryTextActive: {
    color: '#85181C',
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
    color: 'white',
    textAlign: 'center',
  },
  disabledText: {
    color: () => (
      color('#FFFFFF').clearer(0.6).rgbString() // 40% opacity
    ),
  },
});
