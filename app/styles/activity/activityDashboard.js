import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    marginTop: 25,
    alignItems: 'center',
    flexDirection: 'column',
  },
  steps: {
    fontSize: fixedResponsiveFontSize(120),
    marginTop: -110,
    marginBottom: 60,
    color: '#f86c41',
    fontWeight: '500',
  },
  stepsText: {
    fontSize: fixedResponsiveFontSize(24),
    marginTop: -275,
    marginBottom: 100,
    color: '#9da2a7',
    fontWeight: '500',
  },
  timer: {
    marginTop: 5,
    fontSize: fixedResponsiveFontSize(53),
    fontFamily: 'Helvetica',
    color: '#f86c41',
    fontWeight: '500',
  },
  timerText: {
    fontSize: fixedResponsiveFontSize(24),
    marginTop: 40,
    color: '#9da2a7',
    alignItems: 'center',
    fontWeight: '500',
  },
  circle: {
    marginTop: -275,
    marginBottom: 65,
    width: 255,
    height: 255,
    borderRadius: 255 / 2,
    borderWidth: 15,
    borderColor: 'white',
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  progressPie: {
    marginTop: 35,
    alignSelf: 'center',
  },
});
