import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  fixedResponsiveFontSize,
} = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  graphContainer: {
    backgroundColor: '$grey50',
    flex: 1,
  },
  victoryGraph: {
    flex: 1,
    justifyContent: 'center',
  },
  noData: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 0.2,
  },
  goodRating: {
    fontWeight: 'bold',
    paddingRight: applyWidthDifference(15),
    color: '$green400',
  },
  poorRating: {
    fontWeight: 'bold',
    color: '$primaryColor',
  },
  sessionRatingContainer: {
    flexDirection: 'row',
  },
  tabs: {
    flex: 0,
    height: applyWidthDifference(60),
  },
  tabBarUnderlineStyle: {
    borderRadius: 4,
    backgroundColor: '$lightBlue500',
  },
  tabBarTextStyle: {
    fontSize: fixedResponsiveFontSize(14),
    fontWeight: 'bold',
  },
});
