import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    marginBottom: 35,
    alignItems: 'center',
    flexDirection: 'column',
  },
  slouches: {
    fontSize: 30,
    color: '#f86c41',
    fontWeight: '500',
  },
  time: {
    fontSize: 28,
    fontFamily: 'Helvetica',
    fontWeight: '400',
  },
  timeContainer: {
    marginTop: -20,
    alignItems: 'center',
  },
  circle: {
    marginTop: 55,
    marginBottom: -2,
    width: 255,
    height: 255,
    borderRadius: 255 / 2,
    borderWidth: 15,
    borderColor: 'white',
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  progressPie: {
    marginTop: -275,
    marginBottom: 65,
    alignSelf: 'center',
  },
});
