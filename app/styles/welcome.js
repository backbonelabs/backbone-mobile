import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

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
    marginTop: applyWidthDifference(30),
  },
  caption: {
    marginTop: applyWidthDifference(26),
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
    height: applyWidthDifference(50),
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 5,
    backgroundColor: '#4267B2',
    marginBottom: applyWidthDifference(30),
    paddingHorizontal: applyWidthDifference(10),
  },
  fbButtonText: {
    color: '#FFF',
  },
});
