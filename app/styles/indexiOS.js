import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '$iconButton',
    marginTop: '1%',
    flexDirection: 'row',
  },
  menuContainer: {
    flex: 0.5,
    alignSelf: 'flex-start',
  },
  menuButton: {
    marginLeft: '2%',
    width: '$iconButton',
    height: '$iconButton',
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
    width: '$iconButton',
    height: '$iconButton',
    justifyContent: 'center',
  },
  settingsIcon: {
    alignSelf: 'center',
  },
});
