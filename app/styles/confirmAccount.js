import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  confirmText: {
    fontSize: '1rem',
    textAlign: 'center',
  },
  activityIndicator: {
    color: '$primaryColor',
  },
  activityIndicatorContainer: {
    flex: 0.40,
    justifyContent: 'flex-end',
  },
  confirmTextContainer: {
    flex: 0.17,
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  resendTextContainer: {
    flex: 0.43,
    alignItems: 'center',
  },
  resendButton: {
    width: '85%',
    height: '4rem',
    borderRadius: '$buttonBorderRadius',
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
  },
  resendText: {
    fontSize: '1rem',
    color: 'white',
    textAlign: 'center',
  },
});
