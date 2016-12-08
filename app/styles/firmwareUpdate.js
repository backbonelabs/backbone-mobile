import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
  },
  contentContainer: {
    marginVertical: 40,
    justifyContent: 'flex-end',
  },
  spinner: {
    height: 15,
    width: 15,
  },
  progressContainer: {
    width: 215,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  buttonContainer: {
    alignItems: 'center',
  },
});
