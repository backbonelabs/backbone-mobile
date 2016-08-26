import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    flex: 0.6,
    flexDirection: 'row',
  },
  slideNavigationContainer: {
    flex: 0.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideIndicatorContainer: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  slideIndicator: {
    color: '$primaryColor',
  },
  slideIndicatorButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideLeftButton: {
    flex: 0.25,
    height: 50,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  slideRightButton: {
    flex: 0.25,
    height: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  slideLeft: {
    marginLeft: '5%',
    color: 'rgba(0,0,0,0.25)',
  },
  slideRight: {
    marginRight: '5%',
    color: 'rgba(0,0,0,0.25)',
  },
  slideOne: {
    width: '100%',
    backgroundColor: 'red',
  },
  slideTwo: {
    width: '100%',
    backgroundColor: 'orange',
  },
  slideThree: {
    width: '100%',
    backgroundColor: 'yellow',
  },
  button: {
    flex: 0.3,
    justifyContent: 'center',
  },
});
