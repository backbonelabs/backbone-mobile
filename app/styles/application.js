import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  navbarContainer: {
    flex: 1,
    width: '100%',
    height: '$iconButtonSize',
    marginTop: '3%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  navBarTitle: {
    fontSize: '1.25rem',
    textAlign: 'center',
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
