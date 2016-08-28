import EStyleSheet from 'react-native-extended-stylesheet';

const navButton = {
  width: '$iconButtonSize',
  height: '$iconButtonSize',
  alignItems: 'center',
  justifyContent: 'center',
};

export default EStyleSheet.create({
  leftButton: Object.assign({}, navButton, { marginLeft: '1.5%' }),
  rightButton: Object.assign({}, navButton, { marginRight: '1.5%' }),
  leftButtonIcon: {
    alignSelf: 'center',
    color: '$primaryColor',
  },
  titleContainer: {
    marginTop: '0.65rem',
  },
});
