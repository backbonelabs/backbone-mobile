import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  navbarContainer: {
    flex: 1,
    width: '100%',
    height: '7%',
    marginTop: '2%',
    flexDirection: 'row',
  },
  navBarTitle: {
    flex: 0.3,
  },
  navBarText: {
    fontSize: '1.25rem',
    textAlign: 'center',
  },
  menuContainer: {
    flex: 0.35,
    alignSelf: 'flex-start',
  },
  menuButton: {
    marginLeft: '2%',
    width: '$iconButtonSize',
    height: '$iconButtonSize',
  },
  menuIcon: {
    alignSelf: 'center',
  },
  settingsContainer: {
    flex: 0.35,
    alignItems: 'flex-end',
  },
  settingsButton: {
    marginRight: '2%',
    width: '$iconButtonSize',
    height: '$iconButtonSize',
  },
  settingsIcon: {
    alignSelf: 'center',
  },
});
