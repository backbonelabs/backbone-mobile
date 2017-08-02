import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  innerContainer: {
    alignSelf: 'center',
    width: '85%',
    flex: 1,
  },
  stepBar: {
    marginBottom: applyWidthDifference(30),
    marginTop: applyWidthDifference(20),
  },
  header: {
    textAlign: 'center',
    marginBottom: applyWidthDifference(25),
    fontWeight: 'bold',
  },
  genderContainer: {
    marginTop: applyWidthDifference(45),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gender: {
    height: applyWidthDifference(75),
    width: applyWidthDifference(75),
  },
  genderLabel: {
    textAlign: 'center',
    marginTop: applyWidthDifference(10),
    color: '#757575',
  },
  CTAContainer: {
    justifyContent: 'flex-end',
  },
  CTAButton: {
    width: '100%',
    borderRadius: 0,
  },
});
