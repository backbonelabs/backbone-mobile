import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

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
    marginBottom: applyWidthDifference(5),
    marginTop: applyWidthDifference(15),
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
    paddingBottom: applyWidthDifference(25),
    marginTop: applyWidthDifference(30),
  },
  total: {
    position: 'relative',
    alignItems: 'center',
    bottom: 270,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '95%',
    marginTop: applyWidthDifference(5),
    justifyContent: 'space-between',
    flex: 5,
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
    backgroundColor: '$fillColor',
  },
  statsBadHeader: {
    ...statsText,
    color: 'white',
    backgroundColor: '$primaryColor',
  },
});
