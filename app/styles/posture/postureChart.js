import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference, heightDifference } = relativeDimensions;

const statsText = {
  textAlign: 'center',
  paddingTop: 5,
  paddingBottom: 5,
};

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    width: '95%',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 2,
    marginBottom: 5 * heightDifference,
    marginTop: 15 * heightDifference,
    backgroundColor: '$bannerColor',
  },
  icons: {
    paddingRight: applyWidthDifference(25),
    paddingLeft: applyWidthDifference(25),
  },
  chart: {
    width: '95%',
    backgroundColor: '$bannerColor',
    alignItems: 'center',
    flex: 15,
  },
  heading: {
    textAlign: 'center',
    paddingBottom: 25 * heightDifference,
    marginTop: 30 * heightDifference,
  },
  total: {
    position: 'relative',
    alignItems: 'center',
    bottom: 270,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '95%',
    marginTop: 5 * heightDifference,
    justifyContent: 'space-between',
    flex: 5,
  },
  innerContainer: {
    width: applyWidthDifference(150),
    height: 70 * heightDifference,
    backgroundColor: '$bannerColor',
  },
  statsText: { ...statsText },
  statsGoodHeader: {
    ...statsText,
    color: 'white',
    backgroundColor: '#BDBDBD',
  },
  statsBadHeader: {
    ...statsText,
    color: '$primaryColor',
    backgroundColor: '#BDBDBD',
  },
});
