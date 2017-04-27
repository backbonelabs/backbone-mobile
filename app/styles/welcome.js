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
    paddingTop: 30,
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '90%',
  },
});
