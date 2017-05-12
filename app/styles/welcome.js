import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center',
  },
  body: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  heading: {
    marginTop: 30 * heightDifference,
  },
  caption: {
    marginTop: 26 * heightDifference,
  },
  text: {
    textAlign: 'center',
  },
  footer: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  CTAContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '90%',
  },
  fbButton: {
    flexDirection: 'row',
    width: '85%',
    height: 50 * heightDifference,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 5,
    backgroundColor: '#4267B2',
    marginBottom: 30 * heightDifference,
    paddingLeft: 10,
    paddingRight: 10,
  },
  fbButtonText: {
    color: '#FFF',
    fontFamily: 'Geneva',
  },
});
