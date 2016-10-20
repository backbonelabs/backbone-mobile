import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: '$totalNavHeight',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  sessionContainer: {
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  sessionAvatar: {
    backgroundColor: 'red',
    borderRadius: 75,
    width: 150,
    height: 150,
  },
  footer: {
    alignItems: 'center',
  },
  streakCounter: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 10,
  },
});
