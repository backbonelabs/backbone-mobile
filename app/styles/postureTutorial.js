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
  slideIcon: {
    color: '$primaryColor',
  },
  slideIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideLeftIcon: {
    flex: 0.25,
    height: 40,
    marginLeft: '5%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  slideRightIcon: {
    flex: 0.25,
    height: 40,
    marginRight: '5%',
    alignItems: 'flex-end',
    justifyContent: 'center',
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
