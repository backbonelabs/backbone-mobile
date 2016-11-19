import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference, widthDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#EEE',
  },
  cardStyle: {
    width: '100%',

    marginVertical: 3 * heightDifference,
    paddingVertical: 20 * heightDifference,
    paddingHorizontal: 13 * widthDifference,
    borderWidth: 1 * widthDifference,
    borderRadius: 2,
    borderColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1 * heightDifference,
      width: 2 * widthDifference,
    },
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  secondaryText: {
    marginTop: 5 * heightDifference,
  },
  spinner: {
    paddingVertical: 15 * heightDifference,
  },
  icon: {
    height: 45 * heightDifference,
  },
});
