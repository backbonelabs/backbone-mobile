import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    width: '100%',
  },
  textContainer: {
    flex: 0.15,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  text: {
    flex: 0.5,
    textAlign: 'center',
  },
  genderSelectionContainer: {
    flex: 0.15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  gender: {
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  genderText: {
    textAlign: 'center',
  },
  profileInfoContainer: {
    flex: 0.35,
    width: '80%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  birthdate: {
    flex: 0.33,
    borderColor: 'black',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopRightRadius: 4,
    borderTopLeftRadius: 4,
    justifyContent: 'center',
  },
  height: {
    flex: 0.33,
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
  },
  weight: {
    flex: 0.33,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'black',
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4,
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 0.35,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  primaryButton: {
    height: 50,
    width: '80%',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
  },
  primaryButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  pickerToggleText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
