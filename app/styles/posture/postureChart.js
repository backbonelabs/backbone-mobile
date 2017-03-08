import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

const statsText = {
  textAlign: 'center',
  paddingTop: applyWidthDifference(5),
  paddingBottom: applyWidthDifference(5),
};

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    width: applyWidthDifference(350),
    height: applyWidthDifference(55),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: applyWidthDifference(5),
    backgroundColor: '$bannerColor',
  },
  chartContainer: {
    width: applyWidthDifference(350),
    height: applyWidthDifference(350),
    backgroundColor: '$bannerColor',
    alignItems: 'center',
  },
  chart: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  heading: {
    textAlign: 'center',
    paddingBottom: applyWidthDifference(25),
    marginTop: applyWidthDifference(30),
  },
  total: {
    position: 'relative',
    alignItems: 'center',
    bottom: applyWidthDifference(220),
  },
  statsContainer: {
    flexDirection: 'row',
    width: applyWidthDifference(350),
    marginTop: applyWidthDifference(5),
    justifyContent: 'space-between',
  },
  innerContainer: {
    width: applyWidthDifference(150),
    height: applyWidthDifference(70),
    backgroundColor: '$bannerColor',
  },
  statsText: { ...statsText },
  statsGoodHeader: {
    ...statsText,
    color: 'white',
    backgroundColor: '#4CAF50',
  },
  statsBadHeader: {
    ...statsText,
    color: 'white',
    backgroundColor: '$primaryColor',
  },
});
