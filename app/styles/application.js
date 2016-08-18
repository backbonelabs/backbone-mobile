import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  navbarContainer: {
    flex: 1,
    width: '100%',
    height: '$iconButtonSize',
    marginTop: '1%',
    flexDirection: 'row',
  },
  menuContainer: {
    flex: 0.5,
    alignSelf: 'flex-start',
  },
  menuButton: {
    marginLeft: '2%',
    width: '$iconButtonSize',
    height: '$iconButtonSize',
    justifyContent: 'center',
  },
  menuIcon: {
    alignSelf: 'center',
  },
  settingsContainer: {
    flex: 0.5,
    alignItems: 'flex-end',
  },
  settingsButton: {
    marginRight: '2%',
    width: '$iconButtonSize',
    height: '$iconButtonSize',
    justifyContent: 'center',
  },
  settingsIcon: {
    alignSelf: 'center',
  },
});
